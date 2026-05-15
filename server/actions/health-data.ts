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

export async function createHealthData(data: {
  employeeId: string
  healthcareProviderName?: string
  level1HealthFacility?: string
  bpjsNumber?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
  if (!data.employeeId) return { error: "Employee is required" }
  
  try {
    const healthData = await prisma.healthData.create({
      data: {
        employeeId: data.employeeId,
        healthcareProviderName: data.healthcareProviderName,
        level1HealthFacility: data.level1HealthFacility,
        bpjsNumber: data.bpjsNumber,
      },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "HealthData", entityId: healthData.id })
    revalidatePath(`/pegawai/${data.employeeId}`)
    return { success: true, id: healthData.id }
  } catch (e: any) {
    return { error: "Failed to create health data" }
  }
}

export async function updateHealthData(id: string, data: {
  healthcareProviderName?: string
  level1HealthFacility?: string
  bpjsNumber?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
  
  try {
    const existing = await prisma.healthData.findUnique({ where: { id } })
    if (!existing) return { error: "Health data not found" }
    
    await prisma.healthData.update({
      where: { id },
      data: {
        healthcareProviderName: data.healthcareProviderName,
        level1HealthFacility: data.level1HealthFacility,
        bpjsNumber: data.bpjsNumber,
      },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "HealthData", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update health data" }
  }
}

export async function deleteHealthData(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
  
  try {
    const existing = await prisma.healthData.findUnique({ where: { id } })
    if (!existing) return { error: "Health data not found" }
    
    await prisma.healthData.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "HealthData", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete health data" }
  }
}

export async function getHealthData(employeeId: string) {
  try {
    const healthData = await prisma.healthData.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: healthData }
  } catch (e: any) {
    return { error: "Failed to fetch health data" }
  }
}

export async function getAllHealthData(filters?: {
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
        { healthcareProviderName: { contains: filters.search } },
        { level1HealthFacility: { contains: filters.search } },
        { bpjsNumber: { contains: filters.search } },
        { employee: { fullName: { contains: filters.search } } },
      ]
    }

    const healthData = await prisma.healthData.findMany({
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
    return { success: true, data: healthData }
  } catch (e: any) {
    return { error: "Failed to fetch health data" }
  }
}
