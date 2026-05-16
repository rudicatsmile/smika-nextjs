"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canUploadDocuments, canDeleteDocuments, canViewDocuments } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/activity-log"

async function checkUploadPermission() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (!canUploadDocuments(session.user.role as Role)) return null
  return session
}

async function checkDeletePermission() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (!canDeleteDocuments(session.user.role as Role)) return null
  return session
}

async function checkViewPermission() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (!canViewDocuments(session.user.role as Role)) return null
  return session
}

export async function upsertImportantDocument(data: {
  employeeId: string
  documentType: string
  fileUrl?: string
}) {
  const session = await checkUploadPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk mengupload dokumen" }
  if (!data.employeeId || !data.documentType) return { error: "Employee and document type are required" }

  const role = session.user.role as Role

  // PEGAWAI can only upload their own documents
  if (role === "PEGAWAI" && session.user.employeeId && session.user.employeeId !== data.employeeId) {
    return { error: "Anda hanya dapat mengupload dokumen diri sendiri" }
  }

  try {
    // First try to find existing document
    const existing = await prisma.importantDocument.findFirst({
      where: {
        employeeId: data.employeeId,
        documentType: data.documentType,
      },
    })

    let document
    if (existing) {
      // Update existing document
      document = await prisma.importantDocument.update({
        where: { id: existing.id },
        data: {
          fileUrl: data.fileUrl,
        },
      })
    } else {
      // Create new document
      document = await prisma.importantDocument.create({
        data: {
          employeeId: data.employeeId,
          documentType: data.documentType,
          fileUrl: data.fileUrl,
        },
      })
    }

    const action = existing ? "UPDATE" : "CREATE"
    await logActivity({ userId: session.user.id, action: action as "CREATE" | "UPDATE", entity: "ImportantDocument", entityId: document.id })
    revalidatePath("/data-dokumen-penting")
    return { success: true, id: document.id }
  } catch (e: any) {
    console.error("Error upserting important document:", e)
    return { error: "Failed to upsert important document", details: e.message }
  }
}

export async function deleteImportantDocument(id: string) {
  const session = await checkDeletePermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk menghapus dokumen" }

  try {
    const existing = await prisma.importantDocument.findUnique({ where: { id } })
    if (!existing) return { error: "Important document not found" }

    // PEGAWAI can only delete their own documents
    const role = session.user.role as Role
    if (role === "PEGAWAI" && session.user.employeeId && session.user.employeeId !== existing.employeeId) {
      return { error: "Anda hanya dapat menghapus dokumen diri sendiri" }
    }

    await prisma.importantDocument.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "ImportantDocument", entityId: id })
    revalidatePath("/data-dokumen-penting")
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete important document" }
  }
}

export async function getImportantDocuments(employeeId: string) {
  const session = await checkViewPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat dokumen" }

  const role = session.user.role as Role

  // PEGAWAI can only view their own documents
  if (role === "PEGAWAI" && session.user.employeeId && session.user.employeeId !== employeeId) {
    return { error: "Anda hanya dapat melihat dokumen diri sendiri" }
  }

  try {
    const documents = await prisma.importantDocument.findMany({
      where: { employeeId },
      orderBy: { documentType: 'asc' },
    })
    return { success: true, data: documents }
  } catch (e: any) {
    return { error: "Failed to fetch important documents" }
  }
}

export async function getAllImportantDocumentsWithEmployees(filters?: {
  departmentId?: string
  employeeId?: string
  search?: string
}) {
  const session = await checkViewPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat dokumen" }

  const role = session.user.role as Role

  try {
    const where: any = {}

    // PEGAWAI can only see their own documents
    if (role === "PEGAWAI" && session.user.employeeId) {
      where.employeeId = session.user.employeeId
    } else if (filters?.employeeId) {
      where.employeeId = filters.employeeId
    } else if (filters?.departmentId) {
      where.employee = {
        departmentId: filters.departmentId,
      }
    }

    if (filters?.search) {
      where.OR = [
        { employee: { fullName: { contains: filters.search } } },
        { employee: { employeeIdNumber: { contains: filters.search } } },
      ]
    }

    const documents = await prisma.importantDocument.findMany({
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
      orderBy: { uploadedAt: 'desc' },
    })
    return { success: true, data: documents }
  } catch (e: any) {
    return { error: "Failed to fetch important documents" }
  }
}

export async function getEmployeesWithDocumentStatus(filters?: {
  departmentId?: string
  search?: string
  documentStatus?: "all" | "uploaded" | "not_uploaded" | "complete"
}) {
  const session = await checkViewPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat dokumen" }

  const role = session.user.role as Role

  try {
    const where: any = {
      employmentStatus: "AKTIF",
    }

    // PEGAWAI can only see their own data
    if (role === "PEGAWAI" && session.user.employeeId) {
      where.id = session.user.employeeId
    } else if (filters?.departmentId) {
      where.departmentId = filters.departmentId
    }

    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search } },
        { employeeIdNumber: { contains: filters.search } },
      ]
    }

    const employees = await prisma.employee.findMany({
      where,
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
        importantDocuments: {
          select: {
            id: true,
            documentType: true,
            fileUrl: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    })

    // Filter based on document status
    const filteredEmployees = employees.filter((employee: any) => {
      const uploadedCount = employee.importantDocuments.length
      const totalCount = 7 // Total document types

      if (filters?.documentStatus === "uploaded") {
        return uploadedCount > 0
      } else if (filters?.documentStatus === "not_uploaded") {
        return uploadedCount === 0
      } else if (filters?.documentStatus === "complete") {
        return uploadedCount === totalCount
      }
      return true // "all" or no filter
    })

    return { success: true, data: filteredEmployees }
  } catch (e: any) {
    return { error: "Failed to fetch employees with document status" }
  }
}
