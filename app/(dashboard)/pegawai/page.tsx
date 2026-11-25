import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { resolveEmployeeAccessScope, compareEmployeesByHierarchy } from "@/lib/employee-scope"
import { Role } from "@/app/generated/prisma/enums"
import { EmployeeListClient } from "./employee-list-client"

export const dynamic = "force-dynamic"

export default async function PegawaiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const q = sp.q ?? ""
  const dept = sp.dept ?? ""
  const status = sp.status ?? ""
  const page = parseInt(sp.page ?? "1")
  const limit = 15

  const session = await getServerSession(authOptions)
  const role = session?.user?.role as Role | undefined
  const scope = await resolveEmployeeAccessScope(session?.user)

  const where: any = {
    AND: [
      q
        ? {
            OR: [
              { fullName: { contains: q } },
              { employeeIdNumber: { contains: q } },
              { nationalIdNumber: { contains: q } },
              { major: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {},
      // Pembatasan otomatis berdasarkan role (ADMIN_UNIT -> unitnya saja, PEGAWAI -> diri sendiri, SUPER_ADMIN/HR_PUSAT/PIMPINAN/PEMILIK -> semua)
      scope.employeeWhereFilter,
      // Filter ?dept= dari query URL hanya berlaku bagi role yang boleh melihat lintas unit
      scope.canViewAllEmployees && dept ? { departmentId: dept } : {},
      status ? { employmentStatus: status as any } : {},
    ],
  }

  // PEGAWAI tidak perlu filter status
  const effectiveStatusFilter = scope.isSelfScoped ? "" : status

  const [matchingForSort, departments] = await Promise.all([
    prisma.employee.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        employeeIdNumber: true,
        position: { select: { order: true } },
        department: { select: { order: true } },
      },
    }),
    scope.isUnitScoped
      ? scope.unitDepartmentId
        ? prisma.department.findMany({
            where: { id: scope.unitDepartmentId, isActive: true },
            orderBy: { name: "asc" },
          })
        : Promise.resolve([])
      : scope.isSelfScoped
      ? Promise.resolve([])
      : prisma.department.findMany({
          where: { isActive: true },
          orderBy: [{ order: "asc" }, { name: "asc" }],
        }),
  ])

  const sortedIds = [...matchingForSort]
    .sort(compareEmployeesByHierarchy)
    .map((e) => e.id)

  const total = sortedIds.length
  const pageIds = sortedIds.slice((page - 1) * limit, page * limit)

  const pageRows =
    pageIds.length > 0
      ? await prisma.employee.findMany({
          where: { id: { in: pageIds } },
          include: {
            department: { select: { id: true, name: true, order: true } },
            position: { select: { id: true, name: true, order: true } },
          },
        })
      : []

  const rowMap = new Map(pageRows.map((r) => [r.id, r]))
  const employees = pageIds.map((id) => rowMap.get(id)!).filter(Boolean)

  return (
    <EmployeeListClient
      employees={employees}
      total={total}
      page={page}
      limit={limit}
      departments={departments}
      searchQuery={q}
      deptFilter={scope.isUnitScoped ? (scope.unitDepartmentId ?? "") : dept}
      statusFilter={effectiveStatusFilter}
      userRole={role}
      canManage={scope.canMutateEmployees}
      isUnitScoped={scope.isUnitScoped}
      lockedDepartmentId={scope.unitDepartmentId}
      lockedDepartmentName={scope.unitDepartment?.name ?? null}
    />
  )
}
