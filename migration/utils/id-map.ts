import crypto from "crypto"
import mariadb from "mariadb"
import { config } from "../config"

/**
 * Lightweight CUID generator compatible with Prisma cuid() format.
 * Format: c + 24 lowercase alphanumeric characters
 */
export function generateCuid(): string {
  const timestamp = Math.floor(Date.now()).toString(36)
  const randomBytes = crypto.randomBytes(12).toString("hex")
  return `c${timestamp}${randomBytes}`.slice(0, 25)
}

export class IdMap {
  private pool: mariadb.Pool
  private memoryCache: Map<string, string> = new Map()

  constructor() {
    this.pool = mariadb.createPool({
      host: config.oldDb.host,
      port: config.oldDb.port,
      user: config.oldDb.user,
      password: config.oldDb.password,
      database: "simka9", // target database
      connectionLimit: 5,
    })
  }

  async initTable() {
    let conn
    try {
      conn = await this.pool.getConnection()
      await conn.query(`
        CREATE TABLE IF NOT EXISTS _migration_map (
          entity VARCHAR(64) NOT NULL,
          legacy_id VARCHAR(128) NOT NULL,
          new_id VARCHAR(191) NOT NULL,
          migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (entity, legacy_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)

      // Load existing mappings into cache
      const rows = await conn.query("SELECT entity, legacy_id, new_id FROM _migration_map")
      for (const r of rows) {
        this.memoryCache.set(`${r.entity}:${r.legacy_id}`, r.new_id)
      }
    } finally {
      if (conn) conn.release()
    }
  }

  get(entity: string, legacyId: string | number): string | undefined {
    return this.memoryCache.get(`${entity}:${String(legacyId)}`)
  }

  async set(entity: string, legacyId: string | number, newId: string) {
    const key = `${entity}:${String(legacyId)}`
    this.memoryCache.set(key, newId)

    let conn
    try {
      conn = await this.pool.getConnection()
      await conn.query(
        "REPLACE INTO _migration_map (entity, legacy_id, new_id) VALUES (?, ?, ?)",
        [entity, String(legacyId), newId]
      )
    } finally {
      if (conn) conn.release()
    }
  }

  async close() {
    await this.pool.end()
  }
}

export const idMap = new IdMap()
