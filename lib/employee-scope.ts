import { prisma } from "@/lib/prisma"
import { Role } from "@/app/generated/prisma/enums"
import { resolveUserRoleCategory, UserRoleCategory } from "@/lib/role-category"

export interface SessionScopeUser {
  id?: string | null
  role?: Role | string | null
  nip?: string | null
  name?: string | null
  employeeId?: string | null
  departmentId?: string | null
}

export interface ResolvedDepartment {
  id: string
  code: string
  name: string
}

export interface EmployeeAccessScope {
  roleCategory: UserRoleCategory
  /** Dapat melihat semua pegawai lintas unit (SUPER_ADMIN, HR_PUSAT, PIMPINAN, PEMILIK_YAYASAN) */
  canViewAllEmployees: boolean
  /** Diizinkan membuat/edit/hapus/import pegawai (SUPER_ADMIN, HR_PUSAT, atau ADMIN_UNIT untuk unitnya) */
  canMutateEmployees: boolean
  /** Terbatas hanya pada satu unit/departemen (ADMIN_UNIT) */
  isUnitScoped: boolean
  /** Departemen milik ADMIN_UNIT (null jika gagal terpetakan -> fail-closed!) */
  unitDepartment: ResolvedDepartment | null
  unitDepartmentId: string | null
  /** Terbatas hanya pada profil diri sendiri (PEGAWAI) */
  isSelfScoped: boolean
  selfEmployeeId: string | null
  /** Filter Prisma WHERE yang aman & fail-closed untuk model Employee */
  employeeWhereFilter: Record<string, any>
}

/**
 * Menentukan kode departemen target dari NIP / nama akun Admin Unit (fallback jika User.departmentId null).
 */
function resolveTargetDepartmentCode(nip?: string | null, name?: string | null): string | null {
  const cleanNip = (nip || "").toLowerCase()
  const cleanName = (name || "").toLowerCase()

  if (cleanNip.includes("smkdp1") || cleanName.includes("dp 1") || cleanName.includes("dp i") || cleanName.includes("smk 1")) {
    return "2024.01.05"
  }
  if (cleanNip.includes("smkdp2") || cleanName.includes("dp 2") || cleanName.includes("dp ii") || cleanName.includes("smk 2")) {
    return "2024.01.06"
  }
  if (cleanNip.includes("tk") || cleanName.includes("tk")) return "2024.01.02"
  if (cleanNip.includes("sd") || cleanName.includes("sd")) return "2024.01.03"
  if (cleanNip.includes("smp") || cleanName.includes("smp")) return "2024.01.04"
  if (cleanNip.includes("yayasan") || cleanName.includes("yayasan")) return "2024.01.01"
  return null
}

/**
 * Mencari departemen milik akun Admin Unit Lembaga secara presisi:
 * 1. Membaca relasi User.departmentId langsung dari DB (atau session)
 * 2. Fallback presisi berdasarkan kode departemen (2024.01.01 - 2024.01.06)
 */
export async function resolveAdminUnitDepartment(
  user?: SessionScopeUser | null
): Promise<ResolvedDepartment | null> {
  if (!user) return null

  let dbDepartment: ResolvedDepartment | null = null
  let effectiveNip = user.nip
  let effectiveName = user.name

  if (user.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        nip: true,
        name: true,
        departmentId: true,
        department: { select: { id: true, code: true, name: true } },
      },
    })
    if (dbUser) {
      effectiveNip = dbUser.nip ?? effectiveNip
      effectiveName = dbUser.name ?? effectiveName
      if (dbUser.department) {
        dbDepartment = dbUser.department
      }
    }
  }

  if (!dbDepartment && user.departmentId) {
    dbDepartment = await prisma.department.findUnique({
      where: { id: user.departmentId },
      select: { id: true, code: true, name: true },
    })
  }

  if (dbDepartment) return dbDepartment

  const targetCode = resolveTargetDepartmentCode(effectiveNip, effectiveName)
  if (!targetCode) return null

  return await prisma.department.findUnique({
    where: { code: targetCode },
    select: { id: true, code: true, name: true },
  })
}

/**
 * Mengembalikan aturan akses lengkap (fail-closed) untuk modul data pegawai.
 */
export async function resolveEmployeeAccessScope(
  user?: SessionScopeUser | null
): Promise<EmployeeAccessScope> {
  const role = user?.role as Role | undefined

  // Baca departmentId terbaru dari DB jika user.id tersedia agar perubahan di /akun langsung berlaku
  let freshDepartmentId = user?.departmentId ?? null
  let freshEmployeeId = user?.employeeId ?? null
  let freshNip = user?.nip ?? null
  let freshName = user?.name ?? null

  if (user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { departmentId: true, employeeId: true, nip: true, name: true, role: true },
    })
    if (dbUser) {
      freshDepartmentId = dbUser.departmentId
      freshEmployeeId = dbUser.employeeId
      freshNip = dbUser.nip
      freshName = dbUser.name
    }
  }

  const roleCategory = resolveUserRoleCategory(role, freshNip, freshName, freshDepartmentId)

  if (roleCategory === "SUPER_ADMIN" || roleCategory === "HR_PUSAT") {
    return {
      roleCategory,
      canViewAllEmployees: true,
      canMutateEmployees: true,
      isUnitScoped: false,
      unitDepartment: null,
      unitDepartmentId: null,
      isSelfScoped: false,
      selfEmployeeId: freshEmployeeId,
      employeeWhereFilter: {},
    }
  }

  if (roleCategory === "PIMPINAN" || roleCategory === "PEMILIK_YAYASAN") {
    return {
      roleCategory,
      canViewAllEmployees: true,
      canMutateEmployees: false, // View-only
      isUnitScoped: false,
      unitDepartment: null,
      unitDepartmentId: null,
      isSelfScoped: false,
      selfEmployeeId: freshEmployeeId,
      employeeWhereFilter: {},
    }
  }

  if (roleCategory === "ADMIN_UNIT") {
    const unitDepartment = await resolveAdminUnitDepartment({
      id: user?.id,
      nip: freshNip,
      name: freshName,
      departmentId: freshDepartmentId,
    })

    // Fail-closed: jika unit tidak ditemukan, jangan tampilkan data pegawai manapun
    const unitDepartmentId = unitDepartment?.id ?? null
    return {
      roleCategory,
      canViewAllEmployees: false,
      canMutateEmployees: Boolean(unitDepartmentId),
      isUnitScoped: true,
      unitDepartment,
      unitDepartmentId,
      isSelfScoped: false,
      selfEmployeeId: freshEmployeeId,
      employeeWhereFilter: unitDepartmentId
        ? { departmentId: unitDepartmentId }
        : { departmentId: "__UNASSIGNED_UNIT__" },
    }
  }

  // PEGAWAI (atau role tidak dikenal -> fail-closed ke data pribadi saja)
  return {
    roleCategory: "PEGAWAI",
    canViewAllEmployees: false,
    canMutateEmployees: false,
    isUnitScoped: false,
    unitDepartment: null,
    unitDepartmentId: null,
    isSelfScoped: true,
    selfEmployeeId: freshEmployeeId,
    employeeWhereFilter: freshEmployeeId ? { id: freshEmployeeId } : { id: "__NO_EMPLOYEE__" },
  }
}

/**
 * Mengecek apakah user berhak melihat detail record pegawai tertentu.
 */
export function canAccessEmployeeRecord(
  scope: EmployeeAccessScope,
  employee: { id: string; departmentId?: string | null }
): boolean {
  if (scope.canViewAllEmployees) return true
  if (scope.isUnitScoped) {
    return Boolean(scope.unitDepartmentId && employee.departmentId === scope.unitDepartmentId)
  }
  if (scope.isSelfScoped) {
    return Boolean(scope.selfEmployeeId && employee.id === scope.selfEmployeeId)
  }
  return false
}

/**
 * Mengecek apakah user berhak memodifikasi (edit/hapus/blokir) record pegawai tertentu.
 */
export function canMutateEmployeeRecord(
  scope: EmployeeAccessScope,
  employee: { id: string; departmentId?: string | null }
): boolean {
  if (scope.roleCategory === "SUPER_ADMIN" || scope.roleCategory === "HR_PUSAT") {
    return true
  }
  if (scope.isUnitScoped) {
    return Boolean(scope.unitDepartmentId && employee.departmentId === scope.unitDepartmentId)
  }
  return false
}
