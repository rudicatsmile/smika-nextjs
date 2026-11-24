import { Role } from "@/app/generated/prisma/enums"

export type UserRoleCategory =
  | "PEGAWAI"
  | "HR_PUSAT"
  | "ADMIN_UNIT"
  | "PIMPINAN"
  | "SUPER_ADMIN"
  | "PEMILIK_YAYASAN"

/**
 * Resolves user role category distinguishing between:
 * - Pegawai
 * - HR Pusat / Bagian Kepegawaian Yayasan
 * - Akun Admin Unit Lembaga (Role HR: user_tk, user_sd, user_smp, user_smkdp1, user_smkdp2, user_yayasan)
 * - Pimpinan
 * - Super Admin
 * - Pemilik Yayasan
 */
export function resolveUserRoleCategory(
  role?: Role,
  nip?: string | null,
  name?: string | null
): UserRoleCategory {
  if (!role) return "PEGAWAI"
  if (role === "SUPER_ADMIN") return "SUPER_ADMIN"
  if (role === "PEMILIK_YAYASAN_1" || role === "PEMILIK_YAYASAN_2") return "PEMILIK_YAYASAN"
  if (role === "PIMPINAN") return "PIMPINAN"
  if (role === "HR") {
    const cleanNip = (nip || "").toLowerCase()
    const cleanName = (name || "").toLowerCase()
    if (
      cleanNip.startsWith("user_") ||
      cleanNip.includes("tk") ||
      cleanNip.includes("sd") ||
      cleanNip.includes("smp") ||
      cleanNip.includes("smk") ||
      cleanName.includes("lembaga") ||
      cleanName.includes("unit")
    ) {
      return "ADMIN_UNIT"
    }
    return "HR_PUSAT"
  }
  return "PEGAWAI"
}

/**
 * Mendapatkan nama unit khusus untuk Admin Unit Lembaga
 */
export function resolveUnitName(nip?: string | null, name?: string | null): string {
  const cleanNip = (nip || "").toLowerCase()
  if (cleanNip.includes("tk")) return "Unit Lembaga TK"
  if (cleanNip.includes("sd")) return "Unit Lembaga SD"
  if (cleanNip.includes("smp")) return "Unit Lembaga SMP"
  if (cleanNip.includes("smkdp1")) return "Unit Lembaga SMK DP 1"
  if (cleanNip.includes("smkdp2")) return "Unit Lembaga SMK DP 2"
  if (cleanNip.includes("yayasan")) return "Unit Lembaga Yayasan"
  if (name && name.toLowerCase().includes("lembaga")) return name
  return "Admin Unit"
}
