import { EmploymentStatus } from "@/app/generated/prisma/enums"

export const COMPLETENESS_ITEMS = [
  { key: "photo", label: "Foto" },
  { key: "nik", label: "NIK" },
  { key: "bpjs", label: "BPJS" },
  { key: "npwp", label: "NPWP" },
  { key: "ktp", label: "KTP" },
  { key: "kk", label: "KK" },
  { key: "ijazah", label: "Ijazah" },
  { key: "sk", label: "SK" },
] as const

export type CompletenessKey = (typeof COMPLETENESS_ITEMS)[number]["key"]

export interface EmployeeCompletenessSource {
  id: string
  employeeIdNumber: string
  fullName: string
  profilePhoto: string | null
  nationalIdNumber: string | null
  bpjsNumber: string | null
  taxIdNumber: string | null
  employmentStatus: EmploymentStatus
  departmentId: string | null
  department: { id: string; name: string; order: number } | null
  position: { id: string; name: string; order: number } | null
  importantDocuments: { documentType: string; fileUrl: string | null }[]
  healthData: { bpjsNumber: string | null }[]
}

export interface EmployeeCompletenessRow {
  id: string
  employeeIdNumber: string
  fullName: string
  departmentId: string | null
  departmentName: string
  positionName: string
  employmentStatus: EmploymentStatus
  checks: Record<CompletenessKey, boolean>
  filledCount: number
  totalCount: number
  percentage: number
  statusCategory: "LENGKAP" | "SEBAGIAN" | "KOSONG"
}

export function evaluateEmployeeCompleteness(
  emp: EmployeeCompletenessSource
): EmployeeCompletenessRow {
  const uploadedDocTypes = new Set(
    emp.importantDocuments
      .filter((d) => Boolean(d.fileUrl?.trim()))
      .map((d) => d.documentType)
  )

  const hasHealthBpjs = emp.healthData.some((h) => Boolean(h.bpjsNumber?.trim()))

  const checks: Record<CompletenessKey, boolean> = {
    photo: Boolean(emp.profilePhoto?.trim()),
    nik: Boolean(emp.nationalIdNumber?.trim()),
    bpjs: Boolean(emp.bpjsNumber?.trim()) || hasHealthBpjs || uploadedDocTypes.has("BPJS"),
    npwp: Boolean(emp.taxIdNumber?.trim()) || uploadedDocTypes.has("NPWP"),
    ktp: uploadedDocTypes.has("KTP"),
    kk: uploadedDocTypes.has("KARTU_KELUARGA"),
    ijazah: uploadedDocTypes.has("IJAZAH"),
    sk: uploadedDocTypes.has("SK_PENGANGKATAN"),
  }

  const totalCount = COMPLETENESS_ITEMS.length
  const filledCount = COMPLETENESS_ITEMS.filter((item) => checks[item.key]).length
  const percentage = Math.round((filledCount / totalCount) * 100)

  const statusCategory: EmployeeCompletenessRow["statusCategory"] =
    filledCount === totalCount
      ? "LENGKAP"
      : filledCount === 0
      ? "KOSONG"
      : "SEBAGIAN"

  return {
    id: emp.id,
    employeeIdNumber: emp.employeeIdNumber,
    fullName: emp.fullName,
    departmentId: emp.departmentId,
    departmentName: emp.department?.name ?? "-",
    positionName: emp.position?.name ?? "-",
    employmentStatus: emp.employmentStatus,
    checks,
    filledCount,
    totalCount,
    percentage,
    statusCategory,
  }
}

export function filterCompletenessRows(
  rows: EmployeeCompletenessRow[],
  filters: {
    departmentId?: string
    employmentStatus?: string
    completeness?: string
    q?: string
  }
): EmployeeCompletenessRow[] {
  const search = (filters.q ?? "").trim().toLowerCase()

  return rows.filter((row) => {
    if (filters.departmentId && filters.departmentId !== "ALL") {
      if (row.departmentId !== filters.departmentId) return false
    }
    if (filters.employmentStatus && filters.employmentStatus !== "ALL") {
      if (row.employmentStatus !== filters.employmentStatus) return false
    }
    if (filters.completeness && filters.completeness !== "ALL") {
      if (filters.completeness === "LENGKAP" && row.statusCategory !== "LENGKAP") return false
      if (filters.completeness === "BELUM_LENGKAP" && row.statusCategory === "LENGKAP") return false
      if (filters.completeness === "SEBAGIAN" && row.statusCategory !== "SEBAGIAN") return false
      if (filters.completeness === "KOSONG" && row.statusCategory !== "KOSONG") return false
    }
    if (search) {
      const matchName = row.fullName.toLowerCase().includes(search)
      const matchNip = row.employeeIdNumber.toLowerCase().includes(search)
      const matchDept = row.departmentName.toLowerCase().includes(search)
      if (!matchName && !matchNip && !matchDept) return false
    }
    return true
  })
}
