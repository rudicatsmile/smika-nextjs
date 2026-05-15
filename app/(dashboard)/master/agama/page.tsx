import { prisma } from "@/lib/prisma"
import { AgamaClient } from "./agama-client"

export const dynamic = "force-dynamic"

export default async function AgamaPage() {
  const religions = await prisma.religion.findMany({ orderBy: { name: "asc" } })
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Master Data — Agama</h1>
        <p className="text-muted-foreground text-sm">Kelola daftar agama</p>
      </div>
      <AgamaClient religions={religions} />
    </div>
  )
}
