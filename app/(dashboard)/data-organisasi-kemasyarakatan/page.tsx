import { prisma } from "@/lib/prisma"
import { DataOrganisasiKemasyarakatanClient } from "./data-organisasi-kemasyarakatan-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { resolveEmployeeAccessScope } from "@/lib/employee-scope"
import { Role } from "@/app/generated/prisma/enums"

export const dynamic = "force-dynamic"

export default async function DataOrganisasiKemasyarakatanPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role as Role | undefined
  const scope = await resolveEmployeeAccessScope(session?.user)

  const departments = scope.isUnitScoped
    ? scope.unitDepartmentId
      ? await prisma.department.findMany({
          where: { id: scope.unitDepartmentId, isActive: true },
          orderBy: [{ order: "asc" }, { name: "asc" }],
        })
      : []
    : scope.isSelfScoped
    ? []
    : await prisma.department.findMany({
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      })

  const employees = await prisma.employee.findMany({
    where: {
      AND: [
        { employmentStatus: "AKTIF" },
        scope.employeeWhereFilter,
      ],
    },
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
    <DataOrganisasiKemasyarakatanClient
      departments={departments}
      employees={employees}
      userRole={role}
      isUnitScoped={scope.isUnitScoped}
      lockedDepartmentName={scope.unitDepartment?.name ?? null}
    />
  )
}
