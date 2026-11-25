"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  resolveEmployeeAccessScope,
  canAccessEmployeeRecord,
  canMutateEmployeeRecord,
} from "@/lib/employee-scope"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/activity-log"

async function resolveAccessContext() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const scope = await resolveEmployeeAccessScope(session.user)
  return { session, scope }
}

async function checkEmployeeAccess(employeeId: string) {
  const ctx = await resolveAccessContext()
  if (!ctx) return null

  const targetEmployee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  })
  if (!targetEmployee) return null

  const canMutate =
    canMutateEmployeeRecord(ctx.scope, targetEmployee) ||
    (ctx.scope.isSelfScoped && ctx.scope.selfEmployeeId === targetEmployee.id)

  return canMutate ? ctx.session : null
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
    revalidatePath("/riwayat-pendidikan")
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
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk mengedit riwayat pendidikan" }

  try {
    const existing = await prisma.educationHistory.findUnique({
      where: { id },
      include: { employee: { select: { id: true, departmentId: true } } },
    })
    if (!existing) return { error: "Education history not found" }

    const canMutate =
      canMutateEmployeeRecord(ctx.scope, existing.employee) ||
      (ctx.scope.isSelfScoped && ctx.scope.selfEmployeeId === existing.employeeId)
    if (!canMutate) {
      return { error: "Anda tidak memiliki izin untuk mengedit riwayat pendidikan ini" }
    }

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
    await logActivity({ userId: ctx.session.user.id, action: "UPDATE", entity: "EducationHistory", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    revalidatePath("/riwayat-pendidikan")
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update education history" }
  }
}

export async function deleteEducationHistory(id: string) {
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk menghapus riwayat pendidikan" }

  try {
    const existing = await prisma.educationHistory.findUnique({
      where: { id },
      include: { employee: { select: { id: true, departmentId: true } } },
    })
    if (!existing) return { error: "Education history not found" }

    const canMutate =
      canMutateEmployeeRecord(ctx.scope, existing.employee) ||
      (ctx.scope.isSelfScoped && ctx.scope.selfEmployeeId === existing.employeeId)
    if (!canMutate) {
      return { error: "Anda tidak memiliki izin untuk menghapus riwayat pendidikan ini" }
    }

    await prisma.educationHistory.delete({ where: { id } })
    await logActivity({ userId: ctx.session.user.id, action: "DELETE", entity: "EducationHistory", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    revalidatePath("/riwayat-pendidikan")
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete education history" }
  }
}

export async function getEducationHistories(employeeId: string) {
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk melihat riwayat pendidikan" }

  const targetEmployee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  })
  if (!targetEmployee || !canAccessEmployeeRecord(ctx.scope, targetEmployee)) {
    return { error: "Anda tidak memiliki izin untuk melihat riwayat pendidikan pegawai ini" }
  }

  try {
    const histories = await prisma.educationHistory.findMany({
      where: { employeeId },
      include: { education: true },
      orderBy: { graduationYear: "desc" },
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
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk melihat riwayat pendidikan" }

  const { scope } = ctx

  try {
    const where: any = {}

    if (scope.isSelfScoped) {
      where.employeeId = scope.selfEmployeeId ?? "__NO_EMPLOYEE__"
    } else if (scope.isUnitScoped) {
      if (!scope.unitDepartmentId) {
        where.employeeId = "__NO_EMPLOYEE__"
      } else {
        where.employee = { departmentId: scope.unitDepartmentId }
        if (filters?.employeeId) {
          where.employeeId = filters.employeeId
        }
      }
    } else if (scope.canViewAllEmployees) {
      if (filters?.employeeId) {
        where.employeeId = filters.employeeId
      } else if (filters?.departmentId) {
        where.employee = {
          departmentId: filters.departmentId,
        }
      }
    } else {
      where.employeeId = "__NO_EMPLOYEE__"
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
      orderBy: [{ graduationYear: "desc" }, { createdAt: "desc" }],
    })
    return { success: true, data: histories }
  } catch (e: any) {
    return { error: "Failed to fetch education histories" }
  }
}

