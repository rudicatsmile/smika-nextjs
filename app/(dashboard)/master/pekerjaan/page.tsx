import { prisma } from "@/lib/prisma"
import { PekerjaanClient } from "./pekerjaan-client"

export const dynamic = "force-dynamic"

export default async function PekerjaanPage() {
  const occupations = await prisma.occupation.findMany({
    orderBy: { order: "asc" },
  })

  return <PekerjaanClient initialData={occupations} />
}
