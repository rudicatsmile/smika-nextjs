"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  resolveEmployeeAccessScope,
  canAccessEmployeeRecord,
  canMutateEmployeeChildData,
  buildScopedEmployeeRelationWhere,
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

  return canMutateEmployeeChildData(ctx.scope, targetEmployee) ? ctx.session : null
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
    revalidatePath("/data-keluarga")
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
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk mengedit data anak" }

  try {
    const existing = await prisma.child.findUnique({
      where: { id },
      include: { employee: { select: { id: true, departmentId: true } } },
    })
    if (!existing) return { error: "Child not found" }

    if (!canMutateEmployeeChildData(ctx.scope, existing.employee)) {
      return { error: "Anda tidak memiliki izin untuk mengedit data anak ini" }
    }

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
    await logActivity({ userId: ctx.session.user.id, action: "UPDATE", entity: "Child", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    revalidatePath("/data-keluarga")
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update child" }
  }
}

export async function deleteChild(id: string) {
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk menghapus data anak" }

  try {
    const existing = await prisma.child.findUnique({
      where: { id },
      include: { employee: { select: { id: true, departmentId: true } } },
    })
    if (!existing) return { error: "Child not found" }

    if (!canMutateEmployeeChildData(ctx.scope, existing.employee)) {
      return { error: "Anda tidak memiliki izin untuk menghapus data anak ini" }
    }

    await prisma.child.delete({ where: { id } })
    await logActivity({ userId: ctx.session.user.id, action: "DELETE", entity: "Child", entityId: id })
    revalidatePath(`/pegawai/${existing.employeeId}`)
    revalidatePath("/data-keluarga")
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete child" }
  }
}

export async function getChildren(employeeId: string) {
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk melihat data anak" }

  const targetEmployee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  })
  if (!targetEmployee || !canAccessEmployeeRecord(ctx.scope, targetEmployee)) {
    return { error: "Anda tidak memiliki izin untuk melihat data anak pegawai ini" }
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
  const ctx = await resolveAccessContext()
  if (!ctx) return { error: "Anda tidak memiliki izin untuk melihat data anak" }

  try {
    const where = buildScopedEmployeeRelationWhere(ctx.scope, filters)

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

