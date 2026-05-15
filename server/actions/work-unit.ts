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

export async function createWorkUnit(data: {
  employeeId: string
  worksElsewhere: boolean
  workplaceName?: string
  status?: string
  position?: string
  positionFunction?: string
  workplaceAddress?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
  if (!data.employeeId) return { error: "Employee is required" }
  
  try {
    const workUnit = await prisma.workUnit.create({
      data: {
        employeeId: data.employeeId,
        worksElsewhere: data.worksElsewhere,
        workplaceName: data.workplaceName,
        status: data.status,
        position: data.position,
        positionFunction: data.positionFunction,
        workplaceAddress: data.workplaceAddress,
      },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "WorkUnit", entityId: workUnit.id })
    revalidatePath(`/pegawai/${data.employeeId}`)
    return { success: true, id: workUnit.id }
  } catch (e: any) {
    return { error: "Failed to create work unit" }
  }
}

export async function updateWorkUnit(id: string, data: {
  worksElsewhere?: boolean
  workplaceName?: string
  status?: string
  position?: string
  positionFunction?: string
  workplaceAddress?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
  
  try {
    const existing = await prisma.workUnit.findUnique({ where: { id } })
    if (!existing) return { error: "Work unit not found" }
    
    await prisma.workUnit.update({
      where: { id },
      data: {
        worksElsewhere: data.worksElsewhere,
        workplaceName: data.workplaceName,
        status: data.status,
        position: data.position,
        positionFunction: data.positionFunction,
        workplaceAddress: data.workplaceAddress,
      },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "WorkUnit", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update work unit" }
  }
}

export async function deleteWorkUnit(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
  
  try {
    const existing = await prisma.workUnit.findUnique({ where: { id } })
    if (!existing) return { error: "Work unit not found" }
    
    await prisma.workUnit.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "WorkUnit", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete work unit" }
  }
}

export async function getWorkUnits(employeeId: string) {
  try {
    const workUnits = await prisma.workUnit.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: workUnits }
  } catch (e: any) {
    return { error: "Failed to fetch work units" }
  }
}

export async function getAllWorkUnits(filters?: {
  departmentId?: string
  employeeId?: string
  search?: string
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

    if (filters?.search) {
      where.OR = [
        { workplaceName: { contains: filters.search } },
        { position: { contains: filters.search } },
        { positionFunction: { contains: filters.search } },
        { workplaceAddress: { contains: filters.search } },
        { employee: { fullName: { contains: filters.search } } },
      ]
    }

    const workUnits = await prisma.workUnit.findMany({
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
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: workUnits }
  } catch (e: any) {
    return { error: "Failed to fetch work units" }
  }
}
