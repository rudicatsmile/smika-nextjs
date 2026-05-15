import { prisma } from "@/lib/prisma"
import { StatusClient } from "./status-client"

export const dynamic = "force-dynamic"

export default async function StatusKepegawaianPage() {
  const statuses = await prisma.employmentStatusMaster.findMany({ orderBy: { name: "asc" } })
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Master Data — Status Kepegawaian</h1>
        <p className="text-muted-foreground text-sm">PNS, Honorer, Tetap, Kontrak, dll.</p>
      </div>
      <StatusClient statuses={statuses} />
    </div>
  )
}
