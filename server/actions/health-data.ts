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

export async function createHealthData(data: {
  employeeId: string
  healthcareProviderName?: string
  level1HealthFacility?: string
  bpjsNumber?: string
}) {
  const session = await checkEmployeeAccess(data.employeeId)
  if (!session) return { error: "Anda tidak memiliki izin untuk menambahkan data kesehatan" }
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
  if (!session) return { error: "Anda tidak memiliki izin untuk mengedit data kesehatan" }

  try {
    const existing = await prisma.healthData.findUnique({ where: { id } })
    if (!existing) return { error: "Health data not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk mengedit data kesehatan ini" }

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
  if (!session) return { error: "Anda tidak memiliki izin untuk menghapus data kesehatan" }

  try {
    const existing = await prisma.healthData.findUnique({ where: { id } })
    if (!existing) return { error: "Health data not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk menghapus data kesehatan ini" }

    await prisma.healthData.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "HealthData", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete health data" }
  }
}

export async function getHealthData(employeeId: string) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat data kesehatan" }

  const role = session.user.role as Role
  const userEmployeeId = session.user.employeeId as string | undefined

  if (canEditOwnEmployeeData(role) && userEmployeeId && userEmployeeId !== employeeId) {
    return { error: "Anda hanya dapat melihat data kesehatan diri sendiri" }
  }

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
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat data kesehatan" }

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
