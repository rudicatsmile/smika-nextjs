import { prisma } from "@/lib/prisma"
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
      dept ? { departmentId: dept } : {},
      status ? { employmentStatus: status as any } : {},
    ],
  }

  const [employees, total, departments] = await Promise.all([
    prisma.employee.findMany({
      where,
      include: { department: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.employee.count({ where }),
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
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
      statusFilter={status}
    />
  )
}
