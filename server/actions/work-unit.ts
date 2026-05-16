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

export async function createWorkUnit(data: {
  employeeId: string
  worksElsewhere: boolean
  workplaceName?: string
  status?: string
  position?: string
  positionFunction?: string
  workplaceAddress?: string
}) {
  const session = await checkEmployeeAccess(data.employeeId)
  if (!session) return { error: "Anda tidak memiliki izin untuk menambahkan unit kerja lain" }
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
  if (!session) return { error: "Anda tidak memiliki izin untuk mengedit unit kerja lain" }

  try {
    const existing = await prisma.workUnit.findUnique({ where: { id } })
    if (!existing) return { error: "Work unit not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk mengedit unit kerja lain ini" }

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
  if (!session) return { error: "Anda tidak memiliki izin untuk menghapus unit kerja lain" }

  try {
    const existing = await prisma.workUnit.findUnique({ where: { id } })
    if (!existing) return { error: "Work unit not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk menghapus unit kerja lain ini" }

    await prisma.workUnit.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "WorkUnit", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete work unit" }
  }
}

export async function getWorkUnits(employeeId: string) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat unit kerja lain" }

  const role = session.user.role as Role
  const userEmployeeId = session.user.employeeId as string | undefined

  if (canEditOwnEmployeeData(role) && userEmployeeId && userEmployeeId !== employeeId) {
    return { error: "Anda hanya dapat melihat unit kerja lain diri sendiri" }
  }

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
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat unit kerja lain" }

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
