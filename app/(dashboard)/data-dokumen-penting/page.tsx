import { prisma } from "@/lib/prisma"
import { DataDokumenPentingClient } from "./data-dokumen-penting-client"

export const dynamic = "force-dynamic"

export default async function DataDokumenPentingPage() {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })

  return (
    <DataDokumenPentingClient
      departments={departments}
    />
  )
}
