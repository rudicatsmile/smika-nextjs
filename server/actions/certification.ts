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

export async function createCertification(data: {
  employeeId: string
  isCertifiedTeacher: boolean
  certificationBaseSchool?: string
  educationCertificateNumber?: string
  certificationYear?: number
  inpassingBaseSchool?: string
  inpassingSkNumber?: string
  inpassingSkYear?: number
  file?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
  if (!data.employeeId) return { error: "Employee is required" }
  
  try {
    const certification = await prisma.certification.create({
      data: {
        employeeId: data.employeeId,
        isCertifiedTeacher: data.isCertifiedTeacher,
        certificationBaseSchool: data.certificationBaseSchool,
        educationCertificateNumber: data.educationCertificateNumber,
        certificationYear: data.certificationYear,
        inpassingBaseSchool: data.inpassingBaseSchool,
        inpassingSkNumber: data.inpassingSkNumber,
        inpassingSkYear: data.inpassingSkYear,
        file: data.file,
      },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Certification", entityId: certification.id })
    revalidatePath(`/pegawai/${data.employeeId}`)
    return { success: true, id: certification.id }
  } catch (e: any) {
    return { error: "Failed to create certification" }
  }
}

export async function updateCertification(id: string, data: {
  isCertifiedTeacher?: boolean
  certificationBaseSchool?: string
  educationCertificateNumber?: string
  certificationYear?: number
  inpassingBaseSchool?: string
  inpassingSkNumber?: string
  inpassingSkYear?: number
  file?: string
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
  
  try {
    const existing = await prisma.certification.findUnique({ where: { id } })
    if (!existing) return { error: "Certification not found" }
    
    await prisma.certification.update({
      where: { id },
      data: {
        isCertifiedTeacher: data.isCertifiedTeacher,
        certificationBaseSchool: data.certificationBaseSchool,
        educationCertificateNumber: data.educationCertificateNumber,
        certificationYear: data.certificationYear,
        inpassingBaseSchool: data.inpassingBaseSchool,
        inpassingSkNumber: data.inpassingSkNumber,
        inpassingSkYear: data.inpassingSkYear,
        file: data.file,
      },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Certification", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update certification" }
  }
}

export async function deleteCertification(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
  
  try {
    const existing = await prisma.certification.findUnique({ where: { id } })
    if (!existing) return { error: "Certification not found" }
    
    await prisma.certification.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "Certification", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete certification" }
  }
}

export async function getCertifications(employeeId: string) {
  try {
    const certifications = await prisma.certification.findMany({
      where: { employeeId },
      orderBy: { certificationYear: 'desc' },
    })
    return { success: true, data: certifications }
  } catch (e: any) {
    return { error: "Failed to fetch certifications" }
  }
}

export async function getAllCertifications(filters?: {
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
        { certificationBaseSchool: { contains: filters.search } },
        { educationCertificateNumber: { contains: filters.search } },
        { inpassingBaseSchool: { contains: filters.search } },
        { inpassingSkNumber: { contains: filters.search } },
        { employee: { fullName: { contains: filters.search } } },
      ]
    }

    const certifications = await prisma.certification.findMany({
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
      orderBy: { certificationYear: 'desc' },
    })
    return { success: true, data: certifications }
  } catch (e: any) {
    return { error: "Failed to fetch certifications" }
  }
}
