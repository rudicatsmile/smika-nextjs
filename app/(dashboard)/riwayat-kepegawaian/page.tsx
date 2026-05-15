import { prisma } from "@/lib/prisma"
import { RiwayatKepegawaianClient } from "./riwayat-kepegawaian-client"

export const dynamic = "force-dynamic"

export default async function RiwayatKepegawaianPage() {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
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
    <RiwayatKepegawaianClient
      departments={departments}
      employees={employees}
    />
  )
}
