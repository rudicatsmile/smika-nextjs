import { prisma } from "@/lib/prisma"
import { RiwayatPendidikanClient } from "./riwayat-pendidikan-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@/app/generated/prisma/enums"

export const dynamic = "force-dynamic"

export default async function RiwayatPendidikanPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role as Role | undefined
  const userEmployeeId = session?.user?.employeeId as string | undefined

  let departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })

  let whereClause: any = { employmentStatus: "AKTIF" }

  if (role === "PIMPINAN" && userEmployeeId) {
    const user = await prisma.employee.findUnique({
      where: { id: userEmployeeId },
      select: { departmentId: true },
    })
    if (user?.departmentId) {
      departments = departments.filter((d: { id: string }) => d.id === user.departmentId)
      whereClause.departmentId = user.departmentId
    }
  }

  const employees = await prisma.employee.findMany({
    where: whereClause,
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
    <RiwayatPendidikanClient
      departments={departments}
      employees={employees}
      userRole={role}
    />
  )
}
