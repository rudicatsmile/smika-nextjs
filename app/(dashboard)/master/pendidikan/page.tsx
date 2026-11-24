import { prisma } from "@/lib/prisma"
import { PendidikanClient } from "./pendidikan-client"

export const dynamic = "force-dynamic"

export default async function PendidikanPage() {
  const educations = await prisma.education.findMany({
    orderBy: [
      { order: "asc" },
      { name: "asc" },
    ],
  })

  return <PendidikanClient initialData={educations} />
}
