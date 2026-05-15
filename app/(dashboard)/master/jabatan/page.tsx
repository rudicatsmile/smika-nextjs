import { prisma } from "@/lib/prisma"
import { JabatanClient } from "./jabatan-client"

export const dynamic = "force-dynamic"

export default async function JabatanPage() {
  const positions = await prisma.position.findMany({ orderBy: { name: "asc" } })
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Master Data — Jabatan</h1>
        <p className="text-muted-foreground text-sm">Kelola daftar jabatan pegawai</p>
      </div>
      <JabatanClient positions={positions} />
    </div>
  )
}
