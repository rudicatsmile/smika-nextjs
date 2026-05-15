import { Role } from "@/app/generated/prisma/enums"

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  HR: "HR / Kepegawaian",
  PIMPINAN: "Kepala Sekolah / Pimpinan",
  PEGAWAI: "Pegawai",
}

export const ROLE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  HR: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  PIMPINAN:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  PEGAWAI:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
}

export function canManageEmployees(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

export function canViewAll(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR" || role === "PIMPINAN"
}

export function canManageUsers(role: Role): boolean {
  return role === "SUPER_ADMIN"
}

export function canViewLogs(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}

export function canManageMasterData(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR"
}
