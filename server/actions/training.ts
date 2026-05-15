"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canManageEmployees } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/activity-log"

async function checkPermission() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (!canManageEmployees(session.user.role as Role)) return null
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
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
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
  if (!session) return { error: "Access denied" }
  
  try {
    const existing = await prisma.training.findUnique({ where: { id } })
    if (!existing) return { error: "Training not found" }
    
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
  if (!session) return { error: "Access denied" }
  
  try {
    const existing = await prisma.training.findUnique({ where: { id } })
    if (!existing) return { error: "Training not found" }
    
    await prisma.training.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "Training", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete training" }
  }
}

export async function getTrainings(employeeId: string) {
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
  try {
    const where: any = {}
    
    if (filters?.employeeId) {
      where.employeeId = filters.employeeId
    } else if (filters?.departmentId) {
      where.employee = {
        departmentId: filters.departmentId,
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
