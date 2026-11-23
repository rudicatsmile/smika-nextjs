import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? "mysql://root:@localhost:3306/simka9"
  const adapter = new PrismaMariaDb(dbUrl)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

