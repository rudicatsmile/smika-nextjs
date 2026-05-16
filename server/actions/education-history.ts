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
  // Allow PIMPINAN and PEGAWAI in addition to SUPER_ADMIN and HR
  if (!canManageEmployees(role) && !canViewOwnDepartmentEmployees(role) && !canEditOwnEmployeeData(role)) return null
  return session
}

async function checkEmployeeAccess(employeeId: string) {
  const session = await checkPermission()
  if (!session) return null

  const role = session.user.role as Role
  const userEmployeeId = session.user.employeeId as string | undefined

  // PEGAWAI can only access their own data
  if (canEditOwnEmployeeData(role) && userEmployeeId && userEmployeeId !== employeeId) {
    return null
  }

  // PIMPINAN can only access data from their own department
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
  const session = await checkEmployeeAccess(data.employeeId)
  if (!session) return { error: "Anda tidak memiliki izin untuk menambahkan riwayat pendidikan" }
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
  if (!session) return { error: "Anda tidak memiliki izin untuk mengedit riwayat pendidikan" }

  try {
    const existing = await prisma.educationHistory.findUnique({ where: { id } })
    if (!existing) return { error: "Education history not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk mengedit riwayat pendidikan ini" }

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
  if (!session) return { error: "Anda tidak memiliki izin untuk menghapus riwayat pendidikan" }

  try {
    const existing = await prisma.educationHistory.findUnique({ where: { id } })
    if (!existing) return { error: "Education history not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk menghapus riwayat pendidikan ini" }

    await prisma.educationHistory.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "EducationHistory", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete education history" }
  }
}

export async function getEducationHistories(employeeId: string) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat riwayat pendidikan" }

  const role = session.user.role as Role
  const userEmployeeId = session.user.employeeId as string | undefined

  // PEGAWAI can only view their own data
  if (canEditOwnEmployeeData(role) && userEmployeeId && userEmployeeId !== employeeId) {
    return { error: "Anda hanya dapat melihat riwayat pendidikan diri sendiri" }
  }

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
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat riwayat pendidikan" }

  const role = session.user.role as Role
  const userEmployeeId = session.user.employeeId as string | undefined

  try {
    const where: any = {}

    // PEGAWAI can only see their own data
    if (canEditOwnEmployeeData(role) && userEmployeeId) {
      where.employeeId = userEmployeeId
    } else if (filters?.employeeId) {
      where.employeeId = filters.employeeId
    } else if (filters?.departmentId) {
      where.employee = {
        departmentId: filters.departmentId,
      }
    }

    // PIMPINAN can only see data from their own department
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

