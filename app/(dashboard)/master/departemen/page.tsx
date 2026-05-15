import { prisma } from "@/lib/prisma"
import { DepartemenClient } from "./departemen-client"

export const dynamic = "force-dynamic"

export default async function DepartemenPage() {
  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } })
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Master Data — Departemen / Unit</h1>
        <p className="text-muted-foreground text-sm">Kelola unit kerja / departemen yayasan</p>
      </div>
      <DepartemenClient departments={departments} />
    </div>
  )
}
