"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { resolveEmployeeAccessScope, canMutateEmployeeRecord } from "@/lib/employee-scope"

const employeeSchema = z.object({
  employeeIdNumber: z.string().min(1, "NIP wajib diisi"),
  nationalIdNumber: z.string().optional().nullable(),
  bpjsNumber: z.string().optional().nullable(),
  taxIdNumber: z.string().optional().nullable(),
  educatorIdNumber: z.string().optional().nullable(),
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  profilePhoto: z.string().optional().nullable(),
  placeOfBirth: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]).optional().nullable(),
  maritalStatus: z.enum(["BELUM_MENIKAH", "MENIKAH", "CERAI_HIDUP", "CERAI_MATI"]).optional().nullable(),
  employmentStatus: z.enum(["AKTIF", "NON_AKTIF", "CUTI", "PENSIUN"]).default("AKTIF"),
  isBlocked: z.boolean().default(false),
  address: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  secondaryAddress: z.string().optional().nullable(),
  secondaryProvince: z.string().optional().nullable(),
  secondaryPostalCode: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phoneNumber: z.string().optional().nullable(),
  hobbies: z.string().optional().nullable(),
  height: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  positionUnit: z.string().optional().nullable(),
  positionData: z.string().optional().nullable(),
  functionUnit: z.string().optional().nullable(),
  taskUnit: z.string().optional().nullable(),
  teachingUnit: z.string().optional().nullable(),
  joinDate: z.string().optional().nullable(),
  highestEducation: z.string().optional().nullable(),
  major: z.string().optional().nullable(),
  institutionName: z.string().optional().nullable(),
  graduationYear: z.number().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  positionId: z.string().optional().nullable(),
  subjectId: z.string().optional().nullable(),
  employmentStatusId: z.string().optional().nullable(),
  religionId: z.string().optional().nullable(),
  bloodTypeId: z.string().optional().nullable(),
})

export type EmployeeFormData = z.infer<typeof employeeSchema>

function toDate(s?: string | null): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

export async function createEmployee(data: EmployeeFormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Tidak terautentikasi" }

  const scope = await resolveEmployeeAccessScope(session.user)
  if (!scope.canMutateEmployees) return { error: "Anda tidak memiliki izin untuk menambah pegawai" }

  const parsed = employeeSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" }

  const safeData = {
    ...parsed.data,
    ...(scope.isUnitScoped && scope.unitDepartmentId
      ? { departmentId: scope.unitDepartmentId }
      : {}),
  }

  try {
    const employee = await prisma.employee.create({
      data: {
        ...safeData,
        email: safeData.email || null,
        dateOfBirth: toDate(safeData.dateOfBirth),
        joinDate: toDate(safeData.joinDate),
      },
    })
    await logActivity({
      userId: session.user.id,
      action: "CREATE",
      entity: "Employee",
      entityId: employee.id,
      meta: { name: employee.fullName },
    })
    revalidatePath("/pegawai")
    return { success: true, id: employee.id }
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "NIP atau NIK sudah terdaftar" }
    }
    console.error(e)
    return { error: "Gagal menyimpan data pegawai" }
  }
}

export async function updateEmployee(id: string, data: EmployeeFormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Tidak terautentikasi" }

  const scope = await resolveEmployeeAccessScope(session.user)
  const existing = await prisma.employee.findUnique({
    where: { id },
    select: { id: true, departmentId: true },
  })
  if (!existing) return { error: "Data pegawai tidak ditemukan" }

  if (scope.isSelfScoped) {
    return {
      error:
        "Perubahan data pribadi pegawai harus diajukan melalui menu Koreksi Data Mandiri agar diverifikasi HR.",
    }
  }
  if (!canMutateEmployeeRecord(scope, existing)) {
    return { error: "Anda tidak memiliki izin untuk mengedit pegawai di unit ini" }
  }

  const parsed = employeeSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" }

  const safeData = {
    ...parsed.data,
    ...(scope.isUnitScoped && scope.unitDepartmentId
      ? { departmentId: scope.unitDepartmentId }
      : {}),
  }

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...safeData,
        email: safeData.email || null,
        dateOfBirth: toDate(safeData.dateOfBirth),
        joinDate: toDate(safeData.joinDate),
      },
    })
    await logActivity({
      userId: session.user.id,
      action: "UPDATE",
      entity: "Employee",
      entityId: employee.id,
      meta: { name: employee.fullName },
    })
    revalidatePath("/pegawai")
    revalidatePath(`/pegawai/${id}`)
    return { success: true }
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "NIP atau NIK sudah terdaftar" }
    }
    console.error(e)
    return { error: "Gagal memperbarui data pegawai" }
  }
}

export async function deleteEmployee(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Tidak terautentikasi" }

  const scope = await resolveEmployeeAccessScope(session.user)
  const existing = await prisma.employee.findUnique({
    where: { id },
    select: { id: true, departmentId: true, fullName: true },
  })
  if (!existing) return { error: "Data pegawai tidak ditemukan" }
  if (!canMutateEmployeeRecord(scope, existing)) {
    return { error: "Anda tidak memiliki izin untuk menghapus pegawai ini" }
  }

  try {
    const employee = await prisma.employee.delete({ where: { id } })
    await logActivity({
      userId: session.user.id,
      action: "DELETE",
      entity: "Employee",
      entityId: id,
      meta: { name: employee.fullName },
    })
    revalidatePath("/pegawai")
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: "Gagal menghapus pegawai" }
  }
}

export async function blockEmployee(id: string, blocked: boolean) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Tidak terautentikasi" }

  const scope = await resolveEmployeeAccessScope(session.user)
  const existing = await prisma.employee.findUnique({
    where: { id },
    select: { id: true, departmentId: true },
  })
  if (!existing) return { error: "Data pegawai tidak ditemukan" }
  if (!canMutateEmployeeRecord(scope, existing)) {
    return { error: "Anda tidak memiliki izin untuk memblokir pegawai ini" }
  }

  await prisma.employee.update({ where: { id }, data: { isBlocked: blocked } })
  await logActivity({
    userId: session.user.id,
    action: blocked ? "BLOCK" : "UNBLOCK",
    entity: "Employee",
    entityId: id,
  })
  revalidatePath("/pegawai")
  return { success: true }
}
