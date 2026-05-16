import { Role } from "@/app/generated/prisma/enums"

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  HR: "HR / Kepegawaian",
  PIMPINAN: "Kepala Sekolah / Pimpinan",
  PEMILIK_YAYASAN_1: "Pemilik Yayasan 1",
  PEMILIK_YAYASAN_2: "Pemilik Yayasan 2",
  PEGAWAI: "Pegawai",
}

export const ROLE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  HR: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  PIMPINAN:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  PEMILIK_YAYASAN_1:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  PEMILIK_YAYASAN_2:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  PEGAWAI:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
}

// Employee Permissions
export function canManageEmployees(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

export function canViewEmployeeList(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR" || role === "PIMPINAN" || role === "PEMILIK_YAYASAN_1" || role === "PEMILIK_YAYASAN_2"
}

export function canCreateEmployee(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

export function canEditEmployee(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

export function canDeleteEmployee(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

export function canViewEmployeeDetails(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR" || role === "PIMPINAN" || role === "PEMILIK_YAYASAN_1" || role === "PEMILIK_YAYASAN_2" || role === "PEGAWAI"
}

export function canViewAll(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR" || role === "PIMPINAN"
}

// DP3 Permissions
export function canViewDP3(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR" || role === "PIMPINAN" || role === "PEMILIK_YAYASAN_1" || role === "PEMILIK_YAYASAN_2" || role === "PEGAWAI"
}

export function canAssessDP3(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "PIMPINAN"
}

export function canApproveDP3(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "PEMILIK_YAYASAN_1" || role === "PEMILIK_YAYASAN_2"
}

export function canEditDP3(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

export function canDeleteDP3(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

// Kesediaan Permissions
export function canViewKesediaan(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR" || role === "PIMPINAN" || role === "PEGAWAI"
}

export function canSubmitKesediaan(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "PEGAWAI"
}

export function canEditKesediaan(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

export function canDeleteKesediaan(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

// User Management Permissions
export function canManageUsers(role: Role): boolean {
  return role === "SUPER_ADMIN"
}

// Log Permissions
export function canViewLogs(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

// Master Data Permissions
export function canManageMasterData(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

// App Configuration Permissions
export function canManageAppConfig(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

// Document Permissions
export function canViewDocuments(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR" || role === "PIMPINAN" || role === "PEGAWAI"
}

export function canUploadDocuments(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR" || role === "PEGAWAI"
}

export function canDeleteDocuments(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

// Sensitive Data Permissions
export function canViewSensitivePersonalData(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR" || role === "PIMPINAN"
}

export function canViewSalaryData(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

export function canViewContactData(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR" || role === "PIMPINAN"
}

export function canViewAddressData(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR" || role === "PIMPINAN"
}
