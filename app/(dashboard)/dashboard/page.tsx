import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./dashboard-client"
import { startOfMonth } from "date-fns"

async function getDashboardStats() {
  const now = new Date()
  const monthStart = startOfMonth(now)

  const [
    total,
    aktif,
    nonAktif,
    baruBulanIni,
    lakiLaki,
    perempuan,
    perDepartemen,
    allEmployees,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { employmentStatus: "AKTIF" } }),
    prisma.employee.count({ where: { employmentStatus: { in: ["NON_AKTIF", "PENSIUN"] } } }),
    prisma.employee.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.employee.count({ where: { gender: "LAKI_LAKI" } }),
    prisma.employee.count({ where: { gender: "PEREMPUAN" } }),
    prisma.employee.groupBy({
      by: ["departmentId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.employee.findMany({
      select: { dateOfBirth: true, employmentStatus: true },
    }),
  ])

  const departments = await prisma.department.findMany({
    where: { id: { in: perDepartemen.map((d) => d.departmentId).filter(Boolean) as string[] } },
    select: { id: true, name: true },
  })
  const deptMap = new Map(departments.map((d) => [d.id, d.name]))

  const perDeptData = perDepartemen.map((d) => ({
    name: d.departmentId ? (deptMap.get(d.departmentId) ?? "Tidak Diketahui") : "Belum Ditentukan",
    count: d._count.id,
  }))

  // Age brackets
  const ageBrackets: Record<string, number> = {
    "< 25": 0, "25–34": 0, "35–44": 0, "45–54": 0, "≥ 55": 0,
  }
  allEmployees.forEach(({ dateOfBirth }) => {
    if (!dateOfBirth) return
    const age = Math.floor((now.getTime() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
    if (age < 25) ageBrackets["< 25"]++
    else if (age < 35) ageBrackets["25–34"]++
    else if (age < 45) ageBrackets["35–44"]++
    else if (age < 55) ageBrackets["45–54"]++
    else ageBrackets["≥ 55"]++
  })
  const perUsia = Object.entries(ageBrackets).map(([bracket, count]) => ({ bracket, count }))

  const statusCount: Record<string, number> = {}
  allEmployees.forEach(({ employmentStatus }) => {
    const s = employmentStatus ?? "TIDAK DIKETAHUI"
    statusCount[s] = (statusCount[s] || 0) + 1
  })
  const perStatus = Object.entries(statusCount).map(([status, count]) => ({ status, count }))

  const recentEmployees = await prisma.employee.findMany({
    where: { createdAt: { gte: monthStart } },
    include: { department: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return {
    total, aktif, nonAktif, baruBulanIni, lakiLaki, perempuan,
    perDepartemen: perDeptData, perUsia, perStatus, recentEmployees,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selamat datang, {session?.user?.name ?? "Pengguna"}
        </p>
      </div>
      <DashboardClient stats={stats} />
    </div>
  )
}
