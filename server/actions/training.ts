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

export async function createTraining(data: {
  employeeId: string
  name: string
  type: string
  organizerLocation?: string
  batch?: string
  date?: string
  certificateNumber?: string
  certificateDate?: string
  certificateFile?: string
}) {
  const session = await checkEmployeeAccess(data.employeeId)
  if (!session) return { error: "Anda tidak memiliki izin untuk menambahkan pelatihan" }
  if (!data.employeeId || !data.name || !data.type) return { error: "Employee, training name, and type are required" }

  try {
    const training = await prisma.training.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        type: data.type,
        organizerLocation: data.organizerLocation,
        batch: data.batch,
        date: data.date ? new Date(data.date) : null,
        certificateNumber: data.certificateNumber,
        certificateDate: data.certificateDate ? new Date(data.certificateDate) : null,
        certificateFile: data.certificateFile,
      },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Training", entityId: training.id })
    revalidatePath(`/pegawai/${data.employeeId}`)
    revalidatePath("/pelatihan")
    return { success: true, id: training.id }
  } catch (e: any) {
    return { error: "Failed to create training" }
  }
}

export async function updateTraining(id: string, data: {
  name?: string
  type?: string
  organizerLocation?: string
  batch?: string
  date?: string
  certificateNumber?: string
  certificateDate?: string
  certificateFile?: string
}) {
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk mengedit pelatihan" }

  try {
    const existing = await prisma.training.findUnique({
      where: { id },
      include: { employee: { select: { id: true, departmentId: true } } },
    })
    if (!existing) return { error: "Training not found" }

    if (!canMutateEmployeeChildData(ctx.scope, existing.employee)) {
      return { error: "Anda tidak memiliki izin untuk mengedit pelatihan ini" }
    }

    await prisma.training.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        organizerLocation: data.organizerLocation,
        batch: data.batch,
        date: data.date ? new Date(data.date) : null,
        certificateNumber: data.certificateNumber,
        certificateDate: data.certificateDate ? new Date(data.certificateDate) : null,
        certificateFile: data.certificateFile,
      },
    })
    await logActivity({ userId: ctx.session.user.id, action: "UPDATE", entity: "Training", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    revalidatePath("/pelatihan")
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update training" }
  }
}

export async function deleteTraining(id: string) {
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk menghapus pelatihan" }

  try {
    const existing = await prisma.training.findUnique({
      where: { id },
      include: { employee: { select: { id: true, departmentId: true } } },
    })
    if (!existing) return { error: "Training not found" }

    if (!canMutateEmployeeChildData(ctx.scope, existing.employee)) {
      return { error: "Anda tidak memiliki izin untuk menghapus pelatihan ini" }
    }

    await prisma.training.delete({ where: { id } })
    await logActivity({ userId: ctx.session.user.id, action: "DELETE", entity: "Training", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    revalidatePath("/pelatihan")
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete training" }
  }
}

export async function getTrainings(employeeId: string) {
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk melihat pelatihan" }

  const targetEmployee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  })
  if (!targetEmployee || !canAccessEmployeeRecord(ctx.scope, targetEmployee)) {
    return { error: "Anda tidak memiliki izin untuk melihat pelatihan pegawai ini" }
  }

  try {
    const trainings = await prisma.training.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' },
    })
    return { success: true, data: trainings }
  } catch (e: any) {
    return { error: "Failed to fetch trainings" }
  }
}

export async function getAllTrainings(filters?: {
  departmentId?: string
  employeeId?: string
}) {
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk melihat pelatihan" }

  try {
    const where = buildScopedEmployeeRelationWhere(ctx.scope, filters)

    const trainings = await prisma.training.findMany({
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
    return { success: true, data: trainings }
  } catch (e: any) {
    return { error: "Failed to fetch trainings" }
  }
}
