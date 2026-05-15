import { prisma } from "@/lib/prisma"
import { GolonganDarahClient } from "./golongan-darah-client"

export const dynamic = "force-dynamic"

export default async function GolonganDarahPage() {
  const bloodTypes = await prisma.bloodType.findMany({ orderBy: { name: "asc" } })
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Master Data — Golongan Darah</h1>
        <p className="text-muted-foreground text-sm">Kelola daftar golongan darah</p>
      </div>
      <GolonganDarahClient bloodTypes={bloodTypes} />
    </div>
  )
}
