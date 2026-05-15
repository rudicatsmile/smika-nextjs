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

export async function createSpouse(data: {
  employeeId: string
  name: string
  placeOfBirth?: string
  dateOfBirth?: string
  gender?: string
  relationship?: string
  educationId?: string
  occupationId?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
  if (!data.employeeId || !data.name) return { error: "Employee and spouse name are required" }

  try {
    const spouse = await prisma.spouse.create({
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
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Spouse", entityId: spouse.id })
    revalidatePath(`/pegawai/${data.employeeId}`)
    return { success: true, id: spouse.id }
  } catch (e: any) {
    return { error: "Failed to create spouse" }
  }
}

export async function updateSpouse(id: string, data: {
  name?: string
  placeOfBirth?: string
  dateOfBirth?: string
  gender?: string
  relationship?: string
  educationId?: string
  occupationId?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }

  try {
    const existing = await prisma.spouse.findUnique({ where: { id } })
    if (!existing) return { error: "Spouse not found" }

    await prisma.spouse.update({
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
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Spouse", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update spouse" }
  }
}

export async function deleteSpouse(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }

  try {
    const existing = await prisma.spouse.findUnique({ where: { id } })
    if (!existing) return { error: "Spouse not found" }

    await prisma.spouse.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "Spouse", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete spouse" }
  }
}

export async function getSpouses(employeeId: string) {
  try {
    const spouses = await prisma.spouse.findMany({
      where: { employeeId },
      include: { education: true, occupation: true },
      orderBy: { dateOfBirth: 'desc' },
    })
    return { success: true, data: spouses }
  } catch (e: any) {
    return { error: "Failed to fetch spouses" }
  }
}

export async function getAllSpouses(filters?: {
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

    const spouses = await prisma.spouse.findMany({
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
    return { success: true, data: spouses }
  } catch (e: any) {
    return { error: "Failed to fetch spouses" }
  }
}

