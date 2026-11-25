import { prisma } from "@/lib/prisma"
import { AkunClient } from "./akun-client"

export const dynamic = "force-dynamic"

export default async function AkunPage() {
  const [users, employees, departments] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true, name: true, email: true, nip: true, role: true,
        isActive: true, createdAt: true, employeeId: true, departmentId: true,
        employee: { select: { fullName: true, department: { select: { name: true } } } },
        department: { select: { id: true, name: true, code: true } },
      },
    }),
    prisma.employee.findMany({
      where: { user: null },
      select: { id: true, fullName: true, employeeIdNumber: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Akun & Hak Akses</h1>
        <p className="text-muted-foreground text-sm">Kelola akun pengguna, unit lembaga, dan role akses sistem</p>
      </div>
      <AkunClient users={users as any} unlinkedEmployees={employees} departments={departments} />
    </div>
  )
}
