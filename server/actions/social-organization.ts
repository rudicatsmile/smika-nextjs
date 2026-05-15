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

export async function createSocialOrganization(data: {
  employeeId: string
  organizationName?: string
  organizationAddress?: string
  position?: string
  joinDate?: Date | string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
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
  if (!session) return { error: "Access denied" }
  
  try {
    const existing = await prisma.socialOrganization.findUnique({ where: { id } })
    if (!existing) return { error: "Social organization not found" }
    
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
  if (!session) return { error: "Access denied" }
  
  try {
    const existing = await prisma.socialOrganization.findUnique({ where: { id } })
    if (!existing) return { error: "Social organization not found" }
    
    await prisma.socialOrganization.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "SocialOrganization", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete social organization" }
  }
}

export async function getSocialOrganizations(employeeId: string) {
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
