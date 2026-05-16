"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canSubmitKesediaan, canEditKesediaan, canDeleteKesediaan, canViewKesediaan } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/activity-log"

async function checkSubmitPermission() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (!canSubmitKesediaan(session.user.role as Role)) return null
  return session
}

async function checkEditPermission() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (!canEditKesediaan(session.user.role as Role)) return null
  return session
}

async function checkDeletePermission() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (!canDeleteKesediaan(session.user.role as Role)) return null
  return session
}

async function checkViewPermission() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (!canViewKesediaan(session.user.role as Role)) return null
  return session
}

export async function createKesediaan(data: {
  employeeId: string
  tanggal: Date
  isBersedia: boolean
  alasanKesanggupan?: string
  kesediaanHariKerja?: string
  photo?: string
}) {
  const session = await checkSubmitPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk mengirim kesediaan" }
  if (!data.employeeId) return { error: "Employee is required" }

  try {
    const kesediaan = await prisma.kesediaan.create({
      data: {
        employeeId: data.employeeId,
        tanggal: data.tanggal,
        isBersedia: data.isBersedia,
        alasanKesanggupan: data.alasanKesanggupan,
        kesediaanHariKerja: data.kesediaanHariKerja,
        photo: data.photo,
      },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Kesediaan", entityId: kesediaan.id })
    revalidatePath("/kesediaan")
    revalidatePath(`/pegawai/${data.employeeId}`)
    return { success: true, id: kesediaan.id }
  } catch (e: any) {
    console.error("Error creating kesediaan:", e)
    return { error: "Failed to create kesediaan", details: e.message }
  }
}

export async function updateKesediaan(id: string, data: {
  tanggal?: Date
  isBersedia?: boolean
  alasanKesanggupan?: string
  kesediaanHariKerja?: string
  photo?: string
}) {
  const session = await checkEditPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk mengubah kesediaan" }

  try {
    const existing = await prisma.kesediaan.findUnique({ where: { id } })
    if (!existing) return { error: "Kesediaan not found" }

    await prisma.kesediaan.update({
      where: { id },
      data: {
        tanggal: data.tanggal,
        isBersedia: data.isBersedia,
        alasanKesanggupan: data.alasanKesanggupan,
        kesediaanHariKerja: data.kesediaanHariKerja,
        photo: data.photo,
      },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Kesediaan", entityId: id })
    revalidatePath("/kesediaan")
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to update kesediaan" }
  }
}

export async function deleteKesediaan(id: string) {
  const session = await checkDeletePermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk menghapus kesediaan" }

  try {
    const existing = await prisma.kesediaan.findUnique({ where: { id } })
    if (!existing) return { error: "Kesediaan not found" }

    await prisma.kesediaan.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "Kesediaan", entityId: id })
    revalidatePath("/kesediaan")
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    return { error: "Failed to delete kesediaan" }
  }
}

export async function getKesediaan(employeeId: string) {
  const session = await checkViewPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat kesediaan" }

  const role = session.user.role as Role

  try {
    // PEGAWAI can only see their own data
    if (role === "PEGAWAI" && session.user.employeeId && session.user.employeeId !== employeeId) {
      return { error: "Anda tidak memiliki izin untuk melihat kesediaan pegawai lain" }
    }

    const kesediaan = await prisma.kesediaan.findMany({
      where: { employeeId },
      orderBy: { tanggal: 'desc' },
    })
    return { success: true, data: kesediaan }
  } catch (e: any) {
    return { error: "Failed to fetch kesediaan" }
  }
}

export async function getAllKesediaan(filters?: {
  departmentId?: string
  employeeId?: string
  search?: string
}) {
  const session = await checkViewPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat kesediaan" }

  const role = session.user.role as Role

  try {
    const where: any = {}

    // PEGAWAI can only see their own data
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

    const kesediaan = await prisma.kesediaan.findMany({
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
      orderBy: { tanggal: 'desc' },
    })
    return { success: true, data: kesediaan }
  } catch (e: any) {
    return { error: "Failed to fetch kesediaan" }
  }
}

export async function getEmployeesWithKesediaanStatus(filters?: {
  departmentId?: string
  search?: string
  kesediaanStatus?: "all" | "bersedia" | "tidak_bersedia"
}) {
  const session = await checkViewPermission()
  if (!session) return { error: "Anda tidak memiliki izin untuk melihat kesediaan" }

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
        kesediaan: {
          select: {
            id: true,
            tanggal: true,
            isBersedia: true,
            alasanKesanggupan: true,
            kesediaanHariKerja: true,
            photo: true,
          },
          orderBy: { tanggal: 'desc' },
          take: 1,
        },
      },
      orderBy: { fullName: 'asc' },
    })

    // Filter based on kesediaan status
    let filteredEmployees = employees
    if (filters?.kesediaanStatus === "bersedia") {
      filteredEmployees = employees.filter((emp: any) =>
        emp.kesediaan && emp.kesediaan.length > 0 && emp.kesediaan[0].isBersedia === true
      )
    } else if (filters?.kesediaanStatus === "tidak_bersedia") {
      filteredEmployees = employees.filter((emp: any) =>
        emp.kesediaan && emp.kesediaan.length > 0 && emp.kesediaan[0].isBersedia === false
      )
    }

    return { success: true, data: filteredEmployees }
  } catch (e: any) {
    return { error: "Failed to fetch employees with kesediaan status" }
  }
}
