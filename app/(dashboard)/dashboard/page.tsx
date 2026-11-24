import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./dashboard-client"
import { startOfMonth, startOfDay, differenceInYears } from "date-fns"
import { Role, EmploymentStatus } from "@/app/generated/prisma/enums"
import {
  resolveUserRoleCategory,
  UserRoleCategory,
} from "@/lib/role-category"

export const dynamic = "force-dynamic"

/**
 * Mencari unit departemen untuk Admin Unit Lembaga (user_tk, user_sd, dll)
 */
async function resolveUnitDepartment(nip?: string | null, name?: string | null) {
  const cleanNip = (nip || "").toLowerCase()
  const cleanName = (name || "").toLowerCase()

  let keyword = ""
  if (cleanNip.includes("tk") || cleanName.includes("tk")) keyword = "tk"
  else if (cleanNip.includes("sd") || cleanName.includes("sd")) keyword = "sd"
  else if (cleanNip.includes("smp") || cleanName.includes("smp")) keyword = "smp"
  else if (cleanNip.includes("smkdp1") || cleanName.includes("smk 1") || cleanName.includes("smk dp 1")) keyword = "smk"
  else if (cleanNip.includes("smkdp2") || cleanName.includes("smk 2") || cleanName.includes("smk dp 2")) keyword = "smk"
  else if (cleanNip.includes("yayasan") || cleanName.includes("yayasan")) keyword = "yayasan"

  if (!keyword) return null

  return await prisma.department.findFirst({
    where: {
      OR: [
        { code: { contains: keyword } },
        { name: { contains: keyword } },
      ],
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Data Loader: PEGAWAI (Personal Dashboard)
// ─────────────────────────────────────────────────────────────────────────────
async function getPegawaiDashboardData(employeeId?: string | null, nip?: string | null) {
  let employee = null

  if (employeeId) {
    employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        department: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
        employmentStatusRef: { select: { name: true } },
        importantDocuments: { select: { id: true, documentType: true, fileUrl: true } },
        kesediaan: { orderBy: { tanggal: "desc" }, take: 1 },
        dp3: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            statusDP3: { select: { name: true } },
            tahun: { select: { name: true } },
          },
        },
      },
    })
  } else if (nip) {
    employee = await prisma.employee.findFirst({
      where: { employeeIdNumber: nip },
      include: {
        department: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
        employmentStatusRef: { select: { name: true } },
        importantDocuments: { select: { id: true, documentType: true, fileUrl: true } },
        kesediaan: { orderBy: { tanggal: "desc" }, take: 1 },
        dp3: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            statusDP3: { select: { name: true } },
            tahun: { select: { name: true } },
          },
        },
      },
    })
  }

  return { employee }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Data Loader: ADMIN UNIT LEMBAGA (Scoped Unit Dashboard)
// ─────────────────────────────────────────────────────────────────────────────
async function getAdminUnitDashboardData(nip?: string | null, name?: string | null) {
  const dept = await resolveUnitDepartment(nip, name)
  const deptId = dept?.id

  const whereUnit = deptId ? { departmentId: deptId } : {}
  const now = new Date()

  const [
    totalUnit,
    aktifUnit,
    nonAktifUnit,
    lakiLakiUnit,
    perempuanUnit,
    unitEmployees,
  ] = await Promise.all([
    prisma.employee.count({ where: whereUnit }),
    prisma.employee.count({ where: { ...whereUnit, employmentStatus: EmploymentStatus.AKTIF } }),
    prisma.employee.count({ where: { ...whereUnit, employmentStatus: { in: [EmploymentStatus.NON_AKTIF, EmploymentStatus.PENSIUN, EmploymentStatus.CUTI] } } }),
    prisma.employee.count({ where: { ...whereUnit, gender: "LAKI_LAKI" } }),
    prisma.employee.count({ where: { ...whereUnit, gender: "PEREMPUAN" } }),
    prisma.employee.findMany({
      where: whereUnit,
      select: {
        id: true,
        fullName: true,
        employeeIdNumber: true,
        employmentStatus: true,
        dateOfBirth: true,
        position: { select: { name: true } },
        importantDocuments: { select: { id: true, documentType: true, fileUrl: true } },
        kesediaan: { select: { id: true, isBersedia: true }, take: 1, orderBy: { tanggal: "desc" } },
        dp3: { select: { id: true, rataRata: true }, take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { fullName: "asc" },
    }),
  ])

  // Hitung kelengkapan dokumen unit
  let completeDocsCount = 0
  let partialDocsCount = 0
  let emptyDocsCount = 0
  const missingDocsStaff: any[] = []
  const missingKesediaanStaff: any[] = []

  unitEmployees.forEach((emp) => {
    const validDocs = emp.importantDocuments.filter((d) => d.fileUrl).length
    if (validDocs === 7) completeDocsCount++
    else if (validDocs > 0) {
      partialDocsCount++
      if (missingDocsStaff.length < 5) {
        missingDocsStaff.push({
          id: emp.id,
          fullName: emp.fullName,
          nip: emp.employeeIdNumber,
          count: validDocs,
        })
      }
    } else {
      emptyDocsCount++
      if (missingDocsStaff.length < 5) {
        missingDocsStaff.push({
          id: emp.id,
          fullName: emp.fullName,
          nip: emp.employeeIdNumber,
          count: 0,
        })
      }
    }

    if (emp.kesediaan.length === 0 && missingKesediaanStaff.length < 5) {
      missingKesediaanStaff.push({
        id: emp.id,
        fullName: emp.fullName,
        nip: emp.employeeIdNumber,
        position: emp.position?.name ?? "Guru / Staf",
      })
    }
  })

  // Demografi usia unit
  const ageBrackets: Record<string, number> = {
    "< 25": 0, "25–34": 0, "35–44": 0, "45–54": 0, "≥ 55": 0,
  }
  unitEmployees.forEach(({ dateOfBirth }) => {
    if (!dateOfBirth) return
    const age = Math.floor((now.getTime() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
    if (age < 25) ageBrackets["< 25"]++
    else if (age < 35) ageBrackets["25–34"]++
    else if (age < 45) ageBrackets["35–44"]++
    else if (age < 55) ageBrackets["45–54"]++
    else ageBrackets["≥ 55"]++
  })
  const perUsia = Object.entries(ageBrackets).map(([bracket, count]) => ({ bracket, count }))

  // Hitung kesediaan unit
  const submittedKesediaanCount = unitEmployees.filter((e) => e.kesediaan.length > 0).length
  const assessedDP3Count = unitEmployees.filter((e) => e.dp3.length > 0).length

  return {
    department: dept,
    totalUnit,
    aktifUnit,
    nonAktifUnit,
    lakiLakiUnit,
    perempuanUnit,
    completeDocsCount,
    partialDocsCount,
    emptyDocsCount,
    submittedKesediaanCount,
    assessedDP3Count,
    perUsia,
    missingDocsStaff,
    missingKesediaanStaff,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Data Loader: PIMPINAN (Supervisi & Kinerja DP3)
// ─────────────────────────────────────────────────────────────────────────────
async function getPimpinanDashboardData(employeeId?: string | null) {
  let deptId: string | null = null
  let departmentName = "Seluruh Unit Yayasan"

  if (employeeId) {
    const userEmp = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { departmentId: true, department: { select: { name: true } } },
    })
    if (userEmp?.departmentId) {
      deptId = userEmp.departmentId
      departmentName = userEmp.department?.name ?? departmentName
    }
  }

  const whereScope = deptId
    ? { departmentId: deptId, employmentStatus: EmploymentStatus.AKTIF }
    : { employmentStatus: EmploymentStatus.AKTIF }

  const [totalStaff, staffList] = await Promise.all([
    prisma.employee.count({ where: whereScope }),
    prisma.employee.findMany({
      where: whereScope,
      select: {
        id: true,
        fullName: true,
        employeeIdNumber: true,
        department: { select: { name: true } },
        position: { select: { name: true } },
        dp3: {
          select: { id: true, rataRata: true, createdAt: true, statusDP3: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        kesediaan: {
          select: { id: true, isBersedia: true },
          orderBy: { tanggal: "desc" },
          take: 1,
        },
      },
      orderBy: { fullName: "asc" },
    }),
  ])

  // Hitung progres DP3 & antrean belum dinilai
  let assessedCount = 0
  const unAssessedStaff: any[] = []

  staffList.forEach((st) => {
    if (st.dp3.length > 0) {
      assessedCount++
    } else {
      if (unAssessedStaff.length < 6) {
        unAssessedStaff.push({
          id: st.id,
          fullName: st.fullName,
          nip: st.employeeIdNumber,
          department: st.department?.name ?? "-",
          position: st.position?.name ?? "Staf / Pengajar",
        })
      }
    }
  })

  const kesediaanReadyCount = staffList.filter((s) => s.kesediaan.length > 0 && s.kesediaan[0].isBersedia).length

  return {
    departmentName,
    totalStaff,
    assessedCount,
    unAssessedCount: totalStaff - assessedCount,
    kesediaanReadyCount,
    unAssessedStaff,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Data Loader: SUPER_ADMIN (Sistem, Keamanan & Audit Trail)
// ─────────────────────────────────────────────────────────────────────────────
async function getSuperAdminDashboardData() {
  const now = new Date()
  const todayStart = startOfDay(now)

  const [
    totalUsers,
    activeUsers,
    totalEmployees,
    logsToday,
    recentLogs,
    deptCount,
    positionCount,
    subjectCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.employee.count(),
    prisma.activityLog.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.activityLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, role: true } },
      },
    }),
    prisma.department.count(),
    prisma.position.count(),
    prisma.subject.count(),
  ])

  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    totalEmployees,
    logsToday,
    recentLogs,
    masterCounts: {
      departments: deptCount,
      positions: positionCount,
      subjects: subjectCount,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Data Loader: HR PUSAT / YAYASAN (Cross-Unit SDM Intelligence)
// ─────────────────────────────────────────────────────────────────────────────
async function getHrPusatDashboardData() {
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
    recentEmployees,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { employmentStatus: EmploymentStatus.AKTIF } }),
    prisma.employee.count({ where: { employmentStatus: { in: [EmploymentStatus.NON_AKTIF, EmploymentStatus.PENSIUN, EmploymentStatus.CUTI] } } }),
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
    prisma.employee.findMany({
      where: { createdAt: { gte: monthStart } },
      include: { department: { select: { name: true } }, position: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
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

  return {
    total,
    aktif,
    nonAktif,
    baruBulanIni,
    lakiLaki,
    perempuan,
    perDepartemen: perDeptData,
    perUsia,
    perStatus,
    recentEmployees,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Data Loader: PEMILIK YAYASAN (Strategic Oversight & DP3 Approval)
// ─────────────────────────────────────────────────────────────────────────────
async function getPemilikYayasanDashboardData() {
  const [totalEmployees, aktifEmployees, pendingDP3Count, perDepartemen] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { employmentStatus: EmploymentStatus.AKTIF } }),
    prisma.dP3.count(),
    prisma.employee.groupBy({
      by: ["departmentId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
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

  return {
    totalEmployees,
    aktifEmployees,
    pendingDP3Count,
    perDepartemen: perDeptData,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role as Role | undefined
  const nip = session?.user?.nip
  const name = session?.user?.name
  const employeeId = session?.user?.employeeId

  const roleCategory: UserRoleCategory = resolveUserRoleCategory(role, nip, name)

  let dashboardData: any = {}

  switch (roleCategory) {
    case "PEGAWAI":
      dashboardData = await getPegawaiDashboardData(employeeId, nip)
      break
    case "ADMIN_UNIT":
      dashboardData = await getAdminUnitDashboardData(nip, name)
      break
    case "PIMPINAN":
      dashboardData = await getPimpinanDashboardData(employeeId)
      break
    case "SUPER_ADMIN":
      dashboardData = await getSuperAdminDashboardData()
      break
    case "HR_PUSAT":
      dashboardData = await getHrPusatDashboardData()
      break
    case "PEMILIK_YAYASAN":
      dashboardData = await getPemilikYayasanDashboardData()
      break
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <DashboardClient
        roleCategory={roleCategory}
        user={{
          name: name ?? "Pengguna",
          nip: nip ?? null,
          role: role ?? "PEGAWAI",
          employeeId: employeeId ?? null,
        }}
        data={dashboardData}
      />
    </div>
  )
}
