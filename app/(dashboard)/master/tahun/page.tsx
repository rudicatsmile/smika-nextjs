import { prisma } from "@/lib/prisma"
import { TahunClient } from "./tahun-client"

export const dynamic = "force-dynamic"

export default async function TahunPage() {
  const years = await prisma.year.findMany({
    orderBy: { order: "asc" },
  })

  return <TahunClient initialData={years} />
}
