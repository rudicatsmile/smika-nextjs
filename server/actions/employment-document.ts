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

export async function createEmploymentDocument(data: {
  employeeId: string
  letterName: string
  date?: string
  number?: string
  description?: string
  file?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
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
  if (!session) return { error: "Access denied" }
  
  try {
    const existing = await prisma.employmentDocument.findUnique({ where: { id } })
    if (!existing) return { error: "Employment document not found" }
    
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
  if (!session) return { error: "Access denied" }
  
  try {
    const existing = await prisma.employmentDocument.findUnique({ where: { id } })
    if (!existing) return { error: "Employment document not found" }
    
    await prisma.employmentDocument.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "EmploymentDocument", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete employment document" }
  }
}

export async function getEmploymentDocuments(employeeId: string) {
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
  try {
    const where: any = {}
    
    if (filters?.employeeId) {
      where.employeeId = filters.employeeId
    } else if (filters?.departmentId) {
      where.employee = {
        departmentId: filters.departmentId,
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
