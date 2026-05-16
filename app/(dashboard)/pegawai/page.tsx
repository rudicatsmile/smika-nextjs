import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { canViewOwnDepartmentEmployees, canEditOwnEmployeeData } from "@/lib/rbac"
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
  const userEmployeeId = session?.user?.employeeId as string | undefined

  // Fetch user's department if they're PIMPINAN
  let userDepartmentId: string | undefined
  if (role && canViewOwnDepartmentEmployees(role) && userEmployeeId) {
    const user = await prisma.employee.findUnique({
      where: { id: userEmployeeId },
      select: { departmentId: true },
    })
    userDepartmentId = user?.departmentId
  }

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
      // PIMPINAN can only see their own department
      role && canViewOwnDepartmentEmployees(role) && userDepartmentId
        ? { departmentId: userDepartmentId }
        : dept
        ? { departmentId: dept }
        : {},
      // PEGAWAI can only see their own data
      role && canEditOwnEmployeeData(role) && session?.user?.employeeId
        ? { id: session.user.employeeId }
        : {},
      status ? { employmentStatus: status as any } : {},
    ],
  }

  // PEGAWAI should not see status filter
  const effectiveStatusFilter = role && canEditOwnEmployeeData(role) ? "" : status

  const [employees, total, departments] = await Promise.all([
    prisma.employee.findMany({
      where,
      include: { department: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.employee.count({ where }),
    // For PIMPINAN, only show their own department in the filter
    role && canViewOwnDepartmentEmployees(role) && userDepartmentId
      ? prisma.department.findMany({ where: { id: userDepartmentId, isActive: true }, orderBy: { name: "asc" } })
      : prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ])

  return (
    <EmployeeListClient
      employees={employees}
      total={total}
      page={page}
      limit={limit}
      departments={departments}
      searchQuery={q}
      deptFilter={dept}
      statusFilter={effectiveStatusFilter}
      userRole={role}
    />
  )
}
