"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canManageEmployees, canViewOwnDepartmentEmployees, canEditOwnEmployeeData } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/activity-log"

async function checkPermission() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const role = session.user.role as Role
  if (!canManageEmployees(role) && !canViewOwnDepartmentEmployees(role) && !canEditOwnEmployeeData(role)) return null
  return session
}

async function checkEmployeeAccess(employeeId: string) {
  const session = await checkPermission()
  if (!session) return null

  const role = session.user.role as Role
  const userEmployeeId = session.user.employeeId as string | undefined

  if (canEditOwnEmployeeData(role) && userEmployeeId && userEmployeeId !== employeeId) {
    return null
  }

  if (canViewOwnDepartmentEmployees(role) && userEmployeeId) {
    const user = await prisma.employee.findUnique({
      where: { id: userEmployeeId },
      select: { departmentId: true },
    })
    const targetEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { departmentId: true },
    })
    if (user?.departmentId !== targetEmployee?.departmentId) {
      return null
    }
  }

  return session
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
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk mengedit pelatihan" }

  try {
    const existing = await prisma.training.findUnique({ where: { id } })
    if (!existing) return { error: "Training not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk mengedit pelatihan ini" }

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
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Training", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update training" }
  }
}

export async function deleteTraining(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk menghapus pelatihan" }

  try {
    const existing = await prisma.training.findUnique({ where: { id } })
    if (!existing) return { error: "Training not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk menghapus pelatihan ini" }

    await prisma.training.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "Training", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete training" }
  }
}

export async function getTrainings(employeeId: string) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat pelatihan" }

  const role = session.user.role as Role
  const userEmployeeId = session.user.employeeId as string | undefined

  if (canEditOwnEmployeeData(role) && userEmployeeId && userEmployeeId !== employeeId) {
    return { error: "Anda hanya dapat melihat pelatihan diri sendiri" }
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
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat pelatihan" }

  const role = session.user.role as Role
  const userEmployeeId = session.user.employeeId as string | undefined

  try {
    const where: any = {}

    if (canEditOwnEmployeeData(role) && userEmployeeId) {
      where.employeeId = userEmployeeId
    } else if (filters?.employeeId) {
      where.employeeId = filters.employeeId
    } else if (filters?.departmentId) {
      where.employee = {
        departmentId: filters.departmentId,
      }
    }

    if (canViewOwnDepartmentEmployees(role) && userEmployeeId && !filters?.employeeId) {
      const user = await prisma.employee.findUnique({
        where: { id: userEmployeeId },
        select: { departmentId: true },
      })
      if (user?.departmentId) {
        where.employee = {
          departmentId: user.departmentId,
        }
      }
    }

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
