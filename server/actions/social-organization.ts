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

export async function createSocialOrganization(data: {
  employeeId: string
  organizationName?: string
  organizationAddress?: string
  position?: string
  joinDate?: Date | string
}) {
  const session = await checkEmployeeAccess(data.employeeId)
  if (!session) return { error: "Anda tidak memiliki izin untuk menambahkan organisasi masyarakat" }
  if (!data.employeeId) return { error: "Employee is required" }

  try {
    const socialOrganization = await prisma.socialOrganization.create({
      data: {
        employeeId: data.employeeId,
        organizationName: data.organizationName,
        organizationAddress: data.organizationAddress,
        position: data.position,
        joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
      },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "SocialOrganization", entityId: socialOrganization.id })
    revalidatePath(`/pegawai/${data.employeeId}`)
    return { success: true, id: socialOrganization.id }
  } catch (e: any) {
    return { error: "Failed to create social organization" }
  }
}

export async function updateSocialOrganization(id: string, data: {
  organizationName?: string
  organizationAddress?: string
  position?: string
  joinDate?: Date | string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk mengedit organisasi masyarakat" }

  try {
    const existing = await prisma.socialOrganization.findUnique({ where: { id } })
    if (!existing) return { error: "Social organization not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk mengedit organisasi masyarakat ini" }

    await prisma.socialOrganization.update({
      where: { id },
      data: {
        organizationName: data.organizationName,
        organizationAddress: data.organizationAddress,
        position: data.position,
        joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
      },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "SocialOrganization", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update social organization" }
  }
}

export async function deleteSocialOrganization(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk menghapus organisasi masyarakat" }

  try {
    const existing = await prisma.socialOrganization.findUnique({ where: { id } })
    if (!existing) return { error: "Social organization not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk menghapus organisasi masyarakat ini" }

    await prisma.socialOrganization.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "SocialOrganization", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete social organization" }
  }
}

export async function getSocialOrganizations(employeeId: string) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat organisasi masyarakat" }

  const role = session.user.role as Role
  const userEmployeeId = session.user.employeeId as string | undefined

  if (canEditOwnEmployeeData(role) && userEmployeeId && userEmployeeId !== employeeId) {
    return { error: "Anda hanya dapat melihat organisasi masyarakat diri sendiri" }
  }

  try {
    const socialOrganizations = await prisma.socialOrganization.findMany({
      where: { employeeId },
      orderBy: { joinDate: 'desc' },
    })
    return { success: true, data: socialOrganizations }
  } catch (e: any) {
    return { error: "Failed to fetch social organizations" }
  }
}

export async function getAllSocialOrganizations(filters?: {
  departmentId?: string
  employeeId?: string
  search?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat organisasi masyarakat" }

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
        { organizationName: { contains: filters.search } },
        { organizationAddress: { contains: filters.search } },
        { position: { contains: filters.search } },
        { employee: { fullName: { contains: filters.search } } },
      ]
    }

    const socialOrganizations = await prisma.socialOrganization.findMany({
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
      orderBy: { joinDate: 'desc' },
    })
    return { success: true, data: socialOrganizations }
  } catch (e: any) {
    return { error: "Failed to fetch social organizations" }
  }
}
