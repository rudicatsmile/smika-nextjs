import type {
  Employee,
  Department,
  Position,
  Religion,
  BloodType,
  EmploymentStatusMaster,
  EmployeeDocument,
  EmployeeHistory,
} from "@/app/generated/prisma/client"
import type { Gender, MaritalStatus, EmploymentStatus, Role } from "@/app/generated/prisma/enums"

export type { Gender, MaritalStatus, EmploymentStatus, Role }

export type EmployeeWithRelations = Employee & {
  department?: Department | null
  position?: Position | null
  religion?: Religion | null
  bloodType?: BloodType | null
  employmentStatusRef?: EmploymentStatusMaster | null
  documents?: EmployeeDocument[]
  history?: EmployeeHistory[]
}

export interface DashboardStats {
  total: number
  aktif: number
  nonAktif: number
  baruBulanIni: number
  lakiLaki: number
  perempuan: number
  perDepartemen: { name: string; count: number }[]
  perUsia: { bracket: string; count: number }[]
  perStatus: { status: string; count: number }[]
}
