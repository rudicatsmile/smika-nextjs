import { prisma } from "@/lib/prisma"
import { MataPelajaranClient } from "./mata-pelajaran-client"

export const dynamic = "force-dynamic"

export default async function MataPelajaranPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { urutan: "asc" } })
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Master Data — Mata Pelajaran</h1>
        <p className="text-muted-foreground text-sm">Kelola daftar mata pelajaran</p>
      </div>
      <MataPelajaranClient subjects={subjects} />
    </div>
  )
}
