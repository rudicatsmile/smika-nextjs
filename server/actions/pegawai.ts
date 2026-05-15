"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { revalidatePath } from "next/cache"
import { z } from "zod"

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

  const parsed = employeeSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" }

  try {
    const employee = await prisma.employee.create({
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        dateOfBirth: toDate(parsed.data.dateOfBirth),
        joinDate: toDate(parsed.data.joinDate),
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

  const parsed = employeeSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" }

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        dateOfBirth: toDate(parsed.data.dateOfBirth),
        joinDate: toDate(parsed.data.joinDate),
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
