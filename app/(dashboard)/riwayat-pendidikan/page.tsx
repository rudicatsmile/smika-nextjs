import { prisma } from "@/lib/prisma"
import { RiwayatPendidikanClient } from "./riwayat-pendidikan-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@/app/generated/prisma/enums"
import {
  resolveEmployeeAccessScope,
  compareEmployeesByHierarchy,
} from "@/lib/employee-scope"

export const dynamic = "force-dynamic"

export default async function RiwayatPendidikanPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role as Role | undefined
  const scope = await resolveEmployeeAccessScope(session?.user)

  let departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  })

  if (scope.isUnitScoped) {
    departments = scope.unitDepartmentId
      ? departments.filter((d) => d.id === scope.unitDepartmentId)
      : []
  }

  const rawEmployees = await prisma.employee.findMany({
    where: {
      employmentStatus: "AKTIF",
      ...scope.employeeWhereFilter,
    },
    select: {
      id: true,
      fullName: true,
      employeeIdNumber: true,
      departmentId: true,
      position: { select: { order: true } },
      department: { select: { id: true, name: true, order: true } },
    },
  })

  rawEmployees.sort(compareEmployeesByHierarchy)

  const employees = rawEmployees.map((emp) => ({
    id: emp.id,
    fullName: emp.fullName,
    employeeIdNumber: emp.employeeIdNumber,
    departmentId: emp.departmentId,
    department: emp.department
      ? { id: emp.department.id, name: emp.department.name }
      : null,
  }))

  return (
    <RiwayatPendidikanClient
      departments={departments}
      employees={employees}
      userRole={role}
      isUnitScoped={scope.isUnitScoped}
      isSelfScoped={scope.isSelfScoped}
      lockedDepartmentName={
        scope.unitDepartment?.name ?? (scope.isUnitScoped ? "Unit belum diatur" : null)
      }
    />
  )
}
