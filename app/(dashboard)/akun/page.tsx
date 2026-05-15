import { prisma } from "@/lib/prisma"
import { AkunClient } from "./akun-client"

export const dynamic = "force-dynamic"

export default async function AkunPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true, name: true, email: true, nip: true, role: true,
      isActive: true, createdAt: true, employeeId: true,
      employee: { select: { fullName: true, department: { select: { name: true } } } },
    },
  })

  const employees = await prisma.employee.findMany({
    where: { user: null },
    select: { id: true, fullName: true, employeeIdNumber: true },
    orderBy: { fullName: "asc" },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Akun & Hak Akses</h1>
        <p className="text-muted-foreground text-sm">Kelola akun pengguna dan role akses sistem</p>
      </div>
      <AkunClient users={users as any} unlinkedEmployees={employees} />
    </div>
  )
}
