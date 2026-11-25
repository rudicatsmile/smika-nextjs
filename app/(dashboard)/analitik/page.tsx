import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AnalitikClient } from "./analitik-client"
import { Role, EmploymentStatus } from "@/app/generated/prisma/enums"
import { startOfMonth, startOfYear, subMonths } from "date-fns"
import { resolveUserRoleCategory } from "@/lib/role-category"

export const dynamic = "force-dynamic"

async function getAnalitikData() {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const yearStart = startOfYear(now)

  // Ambil semua data employee dengan select minimal
  const [
    totalEmployees,
    aktifEmployees,
    nonAktifEmployees,
    cutiEmployees,
    pensiunEmployees,
    lakiLaki,
    perempuan,
    baruBulanIni,
    baruTahunIni,
    perDepartemen,
    perJabatan,
    allEmployeesForStats,
    recentEmployees,
    totalDocs,
    docsWithFile,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { employmentStatus: EmploymentStatus.AKTIF } }),
    prisma.employee.count({ where: { employmentStatus: EmploymentStatus.NON_AKTIF } }),
    prisma.employee.count({ where: { employmentStatus: EmploymentStatus.CUTI } }),
    prisma.employee.count({ where: { employmentStatus: EmploymentStatus.PENSIUN } }),
    prisma.employee.count({ where: { gender: "LAKI_LAKI" } }),
    prisma.employee.count({ where: { gender: "PEREMPUAN" } }),
    prisma.employee.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.employee.count({ where: { createdAt: { gte: yearStart } } }),
    // Per departemen
    prisma.employee.groupBy({
      by: ["departmentId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    // Per jabatan
    prisma.employee.groupBy({
      by: ["positionId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    // Semua employee untuk stats usia & masa kerja
    prisma.employee.findMany({
      select: {
        dateOfBirth: true,
        joinDate: true,
        employmentStatus: true,
        gender: true,
      },
    }),
    // Pegawai terbaru
    prisma.employee.findMany({
      where: { createdAt: { gte: monthStart } },
      include: {
        department: { select: { name: true } },
        position: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // Kelengkapan dokumen
    prisma.importantDocument.count(),
    prisma.importantDocument.count({ where: { fileUrl: { not: null } } }),
  ])

  // Resolve department names
  const departments = await prisma.department.findMany({
    where: { id: { in: perDepartemen.map((d) => d.departmentId).filter(Boolean) as string[] } },
    select: { id: true, name: true },
  })
  const deptMap = new Map(departments.map((d) => [d.id, d.name]))

  const perDeptData = perDepartemen.map((d) => ({
    name: d.departmentId ? (deptMap.get(d.departmentId) ?? "Tidak Diketahui") : "Belum Ditentukan",
    count: d._count.id,
  }))

  // Resolve position names
  const positions = await prisma.position.findMany({
    where: { id: { in: perJabatan.map((p) => p.positionId).filter(Boolean) as string[] } },
    select: { id: true, name: true },
  })
  const posMap = new Map(positions.map((p) => [p.id, p.name]))

  const perJabatanData = perJabatan.map((p) => ({
    name: p.positionId ? (posMap.get(p.positionId) ?? "Tidak Diketahui") : "Belum Ditentukan",
    count: p._count.id,
  }))

  // Distribusi usia
  const ageBrackets: Record<string, number> = {
    "< 25": 0, "25–34": 0, "35–44": 0, "45–54": 0, "≥ 55": 0,
  }
  allEmployeesForStats.forEach(({ dateOfBirth }) => {
    if (!dateOfBirth) return
    const age = Math.floor((now.getTime() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
    if (age < 25) ageBrackets["< 25"]++
    else if (age < 35) ageBrackets["25–34"]++
    else if (age < 45) ageBrackets["35–44"]++
    else if (age < 55) ageBrackets["45–54"]++
    else ageBrackets["≥ 55"]++
  })
  const perUsia = Object.entries(ageBrackets).map(([bracket, count]) => ({ bracket, count }))

  // Distribusi masa kerja
  const workBrackets: Record<string, number> = {
    "< 1 th": 0, "1–3 th": 0, "4–6 th": 0, "7–10 th": 0, "> 10 th": 0,
  }
  allEmployeesForStats.forEach(({ joinDate }) => {
    if (!joinDate) return
    const years = (now.getTime() - new Date(joinDate).getTime()) / (365.25 * 24 * 3600 * 1000)
    if (years < 1) workBrackets["< 1 th"]++
    else if (years < 4) workBrackets["1–3 th"]++
    else if (years < 7) workBrackets["4–6 th"]++
    else if (years < 11) workBrackets["7–10 th"]++
    else workBrackets["> 10 th"]++
  })
  const perMasaKerja = Object.entries(workBrackets).map(([bracket, count]) => ({ bracket, count }))

  // Trend pertumbuhan 6 bulan terakhir
  const trendMonths = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i)
    return startOfMonth(d)
  })

  const trendCounts = await Promise.all(
    trendMonths.map((monthDate) =>
      prisma.employee.count({
        where: { createdAt: { lte: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0) } },
      })
    )
  )

  const trend = trendMonths.map((d, i) => ({
    bulan: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
    total: trendCounts[i],
  }))

  // Kelengkapan dokumen per employee
  const empDocStats = await prisma.employee.findMany({
    select: {
      id: true,
      fullName: true,
      employeeIdNumber: true,
      department: { select: { name: true } },
      importantDocuments: { select: { documentType: true, fileUrl: true } },
    },
    where: { employmentStatus: EmploymentStatus.AKTIF },
    orderBy: { fullName: "asc" },
    take: 50,
  })

  const docTypes = ["KTP", "KARTU_KELUARGA", "IJAZAH", "NPWP", "BPJS", "SERTIFIKASI_PENDIDIKAN", "SK_PENGANGKATAN"]
  const docTypeLabel: Record<string, string> = {
    KTP: "KTP",
    KARTU_KELUARGA: "KK",
    IJAZAH: "Ijazah",
    NPWP: "NPWP",
    BPJS: "BPJS",
    SERTIFIKASI_PENDIDIKAN: "Sertifikasi",
    SK_PENGANGKATAN: "SK",
  }

  const kelengkapanData = empDocStats.map((emp) => {
    const uploadedTypes = new Set(
      emp.importantDocuments.filter((d) => d.fileUrl).map((d) => d.documentType)
    )
    const filled = docTypes.filter((t) => uploadedTypes.has(t)).length
    return {
      id: emp.id,
      fullName: emp.fullName,
      nip: emp.employeeIdNumber,
      department: emp.department?.name ?? "-",
      filled,
      total: docTypes.length,
      pct: Math.round((filled / docTypes.length) * 100),
    }
  })
  kelengkapanData.sort((a, b) => a.pct - b.pct) // yang paling kurang di atas

  // Rata-rata kelengkapan
  const totalPct = kelengkapanData.reduce((s, e) => s + e.pct, 0)
  const avgKelengkapan = kelengkapanData.length > 0 ? Math.round(totalPct / kelengkapanData.length) : 0

  // Per doc type completion rate
  const perDocType = docTypes.map((type) => {
    const uploaded = empDocStats.filter((emp) =>
      emp.importantDocuments.some((d) => d.documentType === type && d.fileUrl)
    ).length
    return {
      name: docTypeLabel[type] ?? type,
      uploaded,
      total: empDocStats.length,
      pct: empDocStats.length > 0 ? Math.round((uploaded / empDocStats.length) * 100) : 0,
    }
  })

  return {
    summary: {
      totalEmployees,
      aktifEmployees,
      nonAktifEmployees,
      cutiEmployees,
      pensiunEmployees,
      lakiLaki,
      perempuan,
      baruBulanIni,
      baruTahunIni,
      avgKelengkapan,
    },
    perDeptData,
    perJabatanData,
    perUsia,
    perMasaKerja,
    trend,
    kelengkapanData: kelengkapanData.slice(0, 20),
    perDocType,
    recentEmployees: recentEmployees.map((e) => ({
      id: e.id,
      fullName: e.fullName,
      employeeIdNumber: e.employeeIdNumber,
      department: e.department?.name ?? "-",
      position: e.position?.name ?? "-",
      createdAt: e.createdAt.toISOString(),
    })),
  }
}

export default async function AnalitikPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role as Role | undefined
  const nip = session?.user?.nip
  const name = session?.user?.name
  const departmentId = session?.user?.departmentId

  const roleCategory = resolveUserRoleCategory(role, nip, name, departmentId)

  // Hanya SUPER_ADMIN dan HR_PUSAT yang bisa akses
  if (roleCategory !== "SUPER_ADMIN" && roleCategory !== "HR_PUSAT") {
    redirect("/dashboard")
  }

  const data = await getAnalitikData()

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <AnalitikClient data={data} />
    </div>
  )
}
