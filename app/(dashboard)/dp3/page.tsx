import { prisma } from "@/lib/prisma"
import { DP3Client } from "./dp3-client"

export const dynamic = "force-dynamic"

export default async function DP3Page() {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })

  const years = await prisma.year.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  })

  const employees = await prisma.employee.findMany({
    where: { employmentStatus: "AKTIF" },
    select: {
      id: true,
      fullName: true,
      employeeIdNumber: true,
      departmentId: true,
      department: { select: { id: true, name: true } },
    },
    orderBy: { fullName: "asc" },
  })

  return (
    <DP3Client
      departments={departments}
      years={years}
      employees={employees}
    />
  )
}
