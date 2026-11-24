import fs from "fs"
import path from "path"
import { config } from "../config"

export interface MigrationStats {
  total: number
  success: number
  skipped: number
  failed: number
  errors: Array<{ id: string | number; error: string }>
}

export class Logger {
  private logFilePath: string
  private stats: Record<string, MigrationStats> = {}

  constructor() {
    if (!fs.existsSync(config.paths.reports)) {
      fs.mkdirSync(config.paths.reports, { recursive: true })
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    this.logFilePath = path.join(config.paths.reports, `migration-${timestamp}.log`)
    this.writeLog(`=== SIMKA MIGRATION LOG - STARTED AT ${new Date().toISOString()} ===\n`)
  }

  private writeLog(message: string) {
    fs.appendFileSync(this.logFilePath, message + "\n", "utf8")
  }

  initEntity(entity: string) {
    if (!this.stats[entity]) {
      this.stats[entity] = { total: 0, success: 0, skipped: 0, failed: 0, errors: [] }
    }
  }

  info(msg: string) {
    const formatted = `[INFO] ${msg}`
    console.log(`\x1b[36m${formatted}\x1b[0m`)
    this.writeLog(formatted)
  }

  success(entity: string, id: string | number, detail?: string) {
    this.initEntity(entity)
    this.stats[entity].total++
    this.stats[entity].success++
    const msg = `[SUCCESS] [${entity}] #${id}${detail ? ` - ${detail}` : ""}`
    this.writeLog(msg)
  }

  skip(entity: string, id: string | number, reason: string) {
    this.initEntity(entity)
    this.stats[entity].total++
    this.stats[entity].skipped++
    const msg = `[SKIPPED] [${entity}] #${id} - ${reason}`
    console.log(`\x1b[33m${msg}\x1b[0m`)
    this.writeLog(msg)
  }

  error(entity: string, id: string | number, errorMsg: string) {
    this.initEntity(entity)
    this.stats[entity].total++
    this.stats[entity].failed++
    this.stats[entity].errors.push({ id, error: errorMsg })
    const msg = `[ERROR] [${entity}] #${id} - ${errorMsg}`
    console.error(`\x1b[31m${msg}\x1b[0m`)
    this.writeLog(msg)
  }

  section(title: string) {
    const separator = "=".repeat(60)
    console.log(`\n\x1b[35m${separator}\n  ${title}\n${separator}\x1b[0m\n`)
    this.writeLog(`\n${separator}\n  ${title}\n${separator}\n`)
  }

  printSummary() {
    this.section("MIGRATION SUMMARY REPORT")
    console.table(
      Object.entries(this.stats).map(([entity, s]) => ({
        Entity: entity,
        Total: s.total,
        Success: s.success,
        Skipped: s.skipped,
        Failed: s.failed,
      }))
    )

    this.writeLog("Entity Summary Table:\n" + JSON.stringify(this.stats, null, 2))
    this.info(`Full log saved to: ${this.logFilePath}`)
    return this.stats
  }

  getLogPath(): string {
    return this.logFilePath
  }
}

export const logger = new Logger()
