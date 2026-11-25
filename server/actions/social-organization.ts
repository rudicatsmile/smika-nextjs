"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canViewAll, canViewEmployeeList, canEditOwnEmployeeData } from "@/lib/rbac"
import { resolveEmployeeAccessScope, canAccessEmployeeRecord, canMutateEmployeeRecord } from "@/lib/employee-scope"
import { Role } from "@/app/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/activity-log"

async function checkEmployeeAccess(employeeId: string, requireMutate = false) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const scope = await resolveEmployeeAccessScope(session.user)
  const targetEmployee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  })
  if (!targetEmployee) return null

  if (requireMutate) {
    const isSelfEdit = scope.isSelfScoped && scope.selfEmployeeId === employeeId
    if (!isSelfEdit && !canMutateEmployeeRecord(scope, targetEmployee)) {
      return null
    }
  } else {
    if (!canAccessEmployeeRecord(scope, targetEmployee)) {
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
  const session = await checkEmployeeAccess(data.employeeId, true)
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
    revalidatePath("/data-organisasi-kemasyarakatan")
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
  try {
    const existing = await prisma.socialOrganization.findUnique({ where: { id } })
    if (!existing) return { error: "Social organization not found" }

    const session = await checkEmployeeAccess(existing.employeeId, true)
    if (!session) return { error: "Anda tidak memiliki izin untuk mengedit organisasi masyarakat ini" }

    await prisma.socialOrganization.update({
      where: { id },
      data: {
        organizationName: data.organizationName,
        organizationAddress: data.organizationAddress,
        position: data.position,
        joinDate: data.joinDate ? new Date(data.joinDate) : null,
      },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "SocialOrganization", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    revalidatePath("/data-organisasi-kemasyarakatan")
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update social organization" }
  }
}

export async function deleteSocialOrganization(id: string) {
  try {
    const existing = await prisma.socialOrganization.findUnique({ where: { id } })
    if (!existing) return { error: "Social organization not found" }

    const session = await checkEmployeeAccess(existing.employeeId, true)
    if (!session) return { error: "Anda tidak memiliki izin untuk menghapus organisasi masyarakat ini" }

    await prisma.socialOrganization.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "SocialOrganization", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    revalidatePath("/data-organisasi-kemasyarakatan")
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete social organization" }
  }
}

export async function getSocialOrganizations(employeeId: string) {
  const session = await checkEmployeeAccess(employeeId, false)
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat organisasi masyarakat" }

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
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Anda tidak memiliki izin untuk melihat organisasi masyarakat" }

  const role = session.user.role as Role
  if (!canViewEmployeeList(role) && !canViewAll(role) && !canEditOwnEmployeeData(role)) {
    return { error: "Anda tidak memiliki izin untuk melihat organisasi masyarakat" }
  }

  const scope = await resolveEmployeeAccessScope(session.user)

  try {
    const andConditions: any[] = []

    if (scope.isSelfScoped) {
      andConditions.push(
        scope.selfEmployeeId ? { employeeId: scope.selfEmployeeId } : { employeeId: "__NO_EMPLOYEE__" }
      )
    } else if (scope.isUnitScoped) {
      andConditions.push({
        employee: scope.unitDepartmentId
          ? { departmentId: scope.unitDepartmentId }
          : { departmentId: "__UNASSIGNED_UNIT__" },
      })
      if (filters?.employeeId) {
        andConditions.push({ employeeId: filters.employeeId })
      }
    } else {
      if (filters?.employeeId) {
        andConditions.push({ employeeId: filters.employeeId })
      } else if (filters?.departmentId) {
        andConditions.push({ employee: { departmentId: filters.departmentId } })
      }
    }

    if (filters?.search) {
      andConditions.push({
        OR: [
          { organizationName: { contains: filters.search } },
          { organizationAddress: { contains: filters.search } },
          { position: { contains: filters.search } },
          { employee: { fullName: { contains: filters.search } } },
        ],
      })
    }

    const socialOrganizations = await prisma.socialOrganization.findMany({
      where: andConditions.length > 0 ? { AND: andConditions } : undefined,
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
