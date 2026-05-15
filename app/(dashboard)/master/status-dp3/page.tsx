import { prisma } from "@/lib/prisma"
import { StatusDP3Client } from "./status-dp3-client"

export const dynamic = "force-dynamic"

export default async function StatusDP3Page() {
  const statusDP3 = await prisma.statusDP3.findMany({
    orderBy: { order: "asc" },
  })

  return <StatusDP3Client initialData={statusDP3} />
}
