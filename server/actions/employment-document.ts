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

export async function createEmploymentDocument(data: {
  employeeId: string
  letterName: string
  date?: string
  number?: string
  description?: string
  file?: string
}) {
  const session = await checkEmployeeAccess(data.employeeId)
  if (!session) return { error: "Anda tidak memiliki izin untuk menambahkan riwayat kepegawaian" }
  if (!data.employeeId || !data.letterName) return { error: "Employee and letter name are required" }

  try {
    const document = await prisma.employmentDocument.create({
      data: {
        employeeId: data.employeeId,
        letterName: data.letterName,
        date: data.date ? new Date(data.date) : null,
        number: data.number,
        description: data.description,
        file: data.file,
      },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "EmploymentDocument", entityId: document.id })
    revalidatePath(`/pegawai/${data.employeeId}`)
    return { success: true, id: document.id }
  } catch (e: any) {
    return { error: "Failed to create employment document" }
  }
}

export async function updateEmploymentDocument(id: string, data: {
  letterName?: string
  date?: string
  number?: string
  description?: string
  file?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk mengedit riwayat kepegawaian" }

  try {
    const existing = await prisma.employmentDocument.findUnique({ where: { id } })
    if (!existing) return { error: "Employment document not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk mengedit riwayat kepegawaian ini" }

    await prisma.employmentDocument.update({
      where: { id },
      data: {
        letterName: data.letterName,
        date: data.date ? new Date(data.date) : null,
        number: data.number,
        description: data.description,
        file: data.file,
      },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "EmploymentDocument", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update employment document" }
  }
}

export async function deleteEmploymentDocument(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk menghapus riwayat kepegawaian" }

  try {
    const existing = await prisma.employmentDocument.findUnique({ where: { id } })
    if (!existing) return { error: "Employment document not found" }

    const accessCheck = await checkEmployeeAccess(existing.employeeId)
    if (!accessCheck) return { error: "Anda tidak memiliki izin untuk menghapus riwayat kepegawaian ini" }

    await prisma.employmentDocument.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "EmploymentDocument", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete employment document" }
  }
}

export async function getEmploymentDocuments(employeeId: string) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat riwayat kepegawaian" }

  const role = session.user.role as Role
  const userEmployeeId = session.user.employeeId as string | undefined

  if (canEditOwnEmployeeData(role) && userEmployeeId && userEmployeeId !== employeeId) {
    return { error: "Anda hanya dapat melihat riwayat kepegawaian diri sendiri" }
  }

  try {
    const documents = await prisma.employmentDocument.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' },
    })
    return { success: true, data: documents }
  } catch (e: any) {
    return { error: "Failed to fetch employment documents" }
  }
}

export async function getAllEmploymentDocuments(filters?: {
  departmentId?: string
  employeeId?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat riwayat kepegawaian" }

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

    const documents = await prisma.employmentDocument.findMany({
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
      orderBy: { date: 'desc' },
    })
    return { success: true, data: documents }
  } catch (e: any) {
    return { error: "Failed to fetch employment documents" }
  }
}
