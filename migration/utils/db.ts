import mariadb from "mariadb"
import { PrismaClient } from "../../app/generated/prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { config } from "../config"

// 1. Connection pool to legacy database (simka9_ci)
export const oldDbPool = mariadb.createPool(config.oldDb)

// 2. Prisma Client connected to target database (simka9)
const adapter = new PrismaMariaDb(config.newDb.url)
export const newPrisma = new PrismaClient({ adapter })

export async function queryOldDb<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  let conn
  try {
    conn = await oldDbPool.getConnection()
    const rows = await conn.query(sql, params)
    return rows as T[]
  } finally {
    if (conn) conn.release()
  }
}

export async function closeConnections() {
  await oldDbPool.end()
  await newPrisma.$disconnect()
}
