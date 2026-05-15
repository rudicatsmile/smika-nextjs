import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import path from "path"

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db"
  const filePath = dbUrl.replace(/^file:/, "")
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath)
  const adapter = new PrismaBetterSqlite3({ url: resolvedPath })
  return new PrismaClient({ adapter })
}

// Disable global cache in development to ensure fresh instance after schema changes
const prisma = process.env.NODE_ENV === "production"
  ? (globalThis as any).prisma ?? createPrismaClient()
  : createPrismaClient()

if (process.env.NODE_ENV === "production") {
  (globalThis as any).prisma = prisma
}

export { prisma }
