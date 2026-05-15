import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EmployeeDetailClient } from "./employee-detail-client"

export const dynamic = "force-dynamic"

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      position: true,
      religion: true,
      bloodType: true,
      employmentStatusRef: true,
      documents: { orderBy: { uploadedAt: "desc" } },
      history: { orderBy: { date: "desc" } },
    },
  })

  if (!employee) notFound()

  return <EmployeeDetailClient employee={employee} />
}
