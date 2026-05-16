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

export async function createChild(data: {
  employeeId: string
  name: string
  placeOfBirth?: string
  dateOfBirth?: string
  gender?: string
  relationship?: string
  educationId?: string
  occupationId?: string
}) {
  const session = await checkEmployeeAccess(data.employeeId)
  if (!session) return { error: "Anda tidak memiliki izin untuk menambahkan data anak" }
  if (!data.employeeId || !data.name) return { error: "Employee and child name are required" }

  try {
    const child = await prisma.child.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        placeOfBirth: data.placeOfBirth,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender as any,
        relationship: data.relationship,
        educationId: data.educationId,
        occupationId: data.occupationId,
      },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Child", entityId: child.id })
    revalidatePath(`/pegawai/${data.employeeId}`)
    return { success: true, id: child.id }
  } catch (e: any) {
    return { error: "Failed to create child" }
  }
}

export async function updateChild(id: string, data: {
  name?: string
  placeOfBirth?: string
  dateOfBirth?: string
  gender?: string
  relationship?: string
  educationId?: string
  occupationId?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk mengedit data anak" }

  try {
    const existing = await prisma.child.findUnique({ where: { id } })
    if (!existing) return { error: "Child not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk mengedit data anak ini" }

    await prisma.child.update({
      where: { id },
      data: {
        name: data.name,
        placeOfBirth: data.placeOfBirth,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender as any,
        relationship: data.relationship,
        educationId: data.educationId,
        occupationId: data.occupationId,
      },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Child", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update child" }
  }
}

export async function deleteChild(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk menghapus data anak" }

  try {
    const existing = await prisma.child.findUnique({ where: { id } })
    if (!existing) return { error: "Child not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk menghapus data anak ini" }

    await prisma.child.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "Child", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete child" }
  }
}

export async function getChildren(employeeId: string) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat data anak" }

  const role = session.user.role as Role
  const userEmployeeId = session.user.employeeId as string | undefined

  if (canEditOwnEmployeeData(role) && userEmployeeId && userEmployeeId !== employeeId) {
    return { error: "Anda hanya dapat melihat data anak diri sendiri" }
  }

  try {
    const children = await prisma.child.findMany({
      where: { employeeId },
      include: { education: true, occupation: true },
      orderBy: { dateOfBirth: 'desc' },
    })
    return { success: true, data: children }
  } catch (e: any) {
    return { error: "Failed to fetch children" }
  }
}

export async function getAllChildren(filters?: {
  departmentId?: string
  employeeId?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat data anak" }

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

    const children = await prisma.child.findMany({
      where,
      include: {
        education: true,
        occupation: true,
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
      orderBy: { dateOfBirth: 'desc' },
    })
    return { success: true, data: children }
  } catch (e: any) {
    return { error: "Failed to fetch children" }
  }
}

