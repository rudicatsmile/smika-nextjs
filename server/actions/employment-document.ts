"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  resolveEmployeeAccessScope,
  canAccessEmployeeRecord,
  canMutateEmployeeChildData,
  buildScopedEmployeeRelationWhere,
} from "@/lib/employee-scope"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/activity-log"

async function resolveAccessContext() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const scope = await resolveEmployeeAccessScope(session.user)
  return { session, scope }
}

async function checkEmployeeAccess(employeeId: string) {
  const ctx = await resolveAccessContext()
  if (!ctx) return null

  const targetEmployee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  })
  if (!targetEmployee) return null

  return canMutateEmployeeChildData(ctx.scope, targetEmployee) ? ctx.session : null
}

export async function createEmploymentDocument(data: {
  employeeId: string
  letterName: string
  date?: string
  number?: string
  description?: string
  file?: string
}) {
  const session = await checkEmployeeAccess(data.employeeId)
  if (!session) return { error: "Anda tidak memiliki izin untuk menambahkan riwayat kepegawaian" }
  if (!data.employeeId || !data.letterName) return { error: "Employee and letter name are required" }

  try {
    const document = await prisma.employmentDocument.create({
      data: {
        employeeId: data.employeeId,
        letterName: data.letterName,
        date: data.date ? new Date(data.date) : null,
        number: data.number,
        description: data.description,
        file: data.file,
      },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "EmploymentDocument", entityId: document.id })
    revalidatePath(`/pegawai/${data.employeeId}`)
    revalidatePath("/riwayat-kepegawaian")
    return { success: true, id: document.id }
  } catch (e: any) {
    return { error: "Failed to create employment document" }
  }
}

export async function updateEmploymentDocument(id: string, data: {
  letterName?: string
  date?: string
  number?: string
  description?: string
  file?: string
}) {
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk mengedit riwayat kepegawaian" }

  try {
    const existing = await prisma.employmentDocument.findUnique({
      where: { id },
      include: { employee: { select: { id: true, departmentId: true } } },
    })
    if (!existing) return { error: "Employment document not found" }

    if (!canMutateEmployeeChildData(ctx.scope, existing.employee)) {
      return { error: "Anda tidak memiliki izin untuk mengedit riwayat kepegawaian ini" }
    }

    await prisma.employmentDocument.update({
      where: { id },
      data: {
        letterName: data.letterName,
        date: data.date ? new Date(data.date) : null,
        number: data.number,
        description: data.description,
        file: data.file,
      },
    })
    await logActivity({ userId: ctx.session.user.id, action: "UPDATE", entity: "EmploymentDocument", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    revalidatePath("/riwayat-kepegawaian")
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update employment document" }
  }
}

export async function deleteEmploymentDocument(id: string) {
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk menghapus riwayat kepegawaian" }

  try {
    const existing = await prisma.employmentDocument.findUnique({
      where: { id },
      include: { employee: { select: { id: true, departmentId: true } } },
    })
    if (!existing) return { error: "Employment document not found" }

    if (!canMutateEmployeeChildData(ctx.scope, existing.employee)) {
      return { error: "Anda tidak memiliki izin untuk menghapus riwayat kepegawaian ini" }
    }

    await prisma.employmentDocument.delete({ where: { id } })
    await logActivity({ userId: ctx.session.user.id, action: "DELETE", entity: "EmploymentDocument", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    revalidatePath("/riwayat-kepegawaian")
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete employment document" }
  }
}

export async function getEmploymentDocuments(employeeId: string) {
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk melihat riwayat kepegawaian" }

  const targetEmployee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  })
  if (!targetEmployee || !canAccessEmployeeRecord(ctx.scope, targetEmployee)) {
    return { error: "Anda tidak memiliki izin untuk melihat riwayat kepegawaian pegawai ini" }
  }

  try {
    const documents = await prisma.employmentDocument.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' },
    })
    return { success: true, data: documents }
  } catch (e: any) {
    return { error: "Failed to fetch employment documents" }
  }
}

export async function getAllEmploymentDocuments(filters?: {
  departmentId?: string
  employeeId?: string
}) {
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk melihat riwayat kepegawaian" }

  try {
    const where = buildScopedEmployeeRelationWhere(ctx.scope, filters)

    const documents = await prisma.employmentDocument.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeIdNumber: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    })
    return { success: true, data: documents }
  } catch (e: any) {
    return { error: "Failed to fetch employment documents" }
  }
}
