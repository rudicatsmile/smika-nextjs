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

export async function createEducationHistory(data: {
  employeeId: string
  educationId: string
  institutionName?: string
  major?: string
  graduationYear?: number
  startDate?: string
  endDate?: string
  gpa?: number
  isGraduated?: boolean
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
  if (!data.employeeId || !data.educationId) return { error: "Employee and education are required" }

  try {
    const eduHistory = await prisma.educationHistory.create({
      data: {
        employeeId: data.employeeId,
        educationId: data.educationId,
        institutionName: data.institutionName,
        major: data.major,
        graduationYear: data.graduationYear,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        gpa: data.gpa,
        isGraduated: data.isGraduated ?? true,
      },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "EducationHistory", entityId: eduHistory.id })
    revalidatePath(`/pegawai/${data.employeeId}`)
    return { success: true, id: eduHistory.id }
  } catch (e: any) {
    return { error: "Failed to create education history" }
  }
}

export async function updateEducationHistory(id: string, data: {
  educationId?: string
  institutionName?: string
  major?: string
  graduationYear?: number
  startDate?: string
  endDate?: string
  gpa?: number
  isGraduated?: boolean
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }

  try {
    const existing = await prisma.educationHistory.findUnique({ where: { id } })
    if (!existing) return { error: "Education history not found" }

    await prisma.educationHistory.update({
      where: { id },
      data: {
        educationId: data.educationId,
        institutionName: data.institutionName,
        major: data.major,
        graduationYear: data.graduationYear,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        gpa: data.gpa,
        isGraduated: data.isGraduated,
      },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "EducationHistory", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update education history" }
  }
}

export async function deleteEducationHistory(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }

  try {
    const existing = await prisma.educationHistory.findUnique({ where: { id } })
    if (!existing) return { error: "Education history not found" }

    await prisma.educationHistory.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "EducationHistory", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete education history" }
  }
}

export async function getEducationHistories(employeeId: string) {
  try {
    const histories = await prisma.educationHistory.findMany({
      where: { employeeId },
      include: { education: true },
      orderBy: { graduationYear: 'desc' },
    })
    return { success: true, data: histories }
  } catch (e: any) {
    return { error: "Failed to fetch education histories" }
  }
}

export async function getAllEducationHistories(filters?: {
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

    const histories = await prisma.educationHistory.findMany({
      where,
      include: {
        education: true,
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
      orderBy: { graduationYear: 'desc' },
    })
    return { success: true, data: histories }
  } catch (e: any) {
    return { error: "Failed to fetch education histories" }
  }
}

