import { prisma } from "@/lib/prisma"
import { PendidikanClient } from "./pendidikan-client"

export default async function PendidikanPage() {
  const educations = await prisma.education.findMany({
    orderBy: { level: "asc" },
  })

  return <PendidikanClient initialData={educations} />
}
