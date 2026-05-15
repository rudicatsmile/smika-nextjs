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

export async function createDP3(data: {
  employeeId: string
  tahunId: string
  statusDP3Id: string
  kualitasKerjaNilai: number
  kualitasKerjaAlasan?: string
  kehadiranDanKedisiplinanNilai: number
  kehadiranDanKedisiplinanAlasan?: string
  kerjasamaTimNilai: number
  kerjasamaTimAlasan?: string
  komitmenVisiMisiNilai: number
  komitmenVisiMisiAlasan?: string
  pengembanganDiriNilai: number
  pengembanganDiriAlasan?: string
  penggunaanTeknologiNilai: number
  penggunaanTeknologiAlasan?: string
  ketaatanKepatuhanNilai: number
  ketaatanKepatuhanAlasan?: string
  komunikasiEfektifNilai: number
  komunikasiEfektifAlasan?: string
  inisiatifProblemSolvingNilai: number
  inisiatifProblemSolvingAlasan?: string
  jumlah: number
  rataRata: number
  bobot: number
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }
  if (!data.employeeId) return { error: "Employee is required" }

  try {
    const dp3 = await prisma.dP3.create({
      data: {
        employeeId: data.employeeId,
        tahunId: data.tahunId,
        statusDP3Id: data.statusDP3Id,
        kualitasKerjaNilai: data.kualitasKerjaNilai,
        kualitasKerjaAlasan: data.kualitasKerjaAlasan,
        kehadiranDanKedisiplinanNilai: data.kehadiranDanKedisiplinanNilai,
        kehadiranDanKedisiplinanAlasan: data.kehadiranDanKedisiplinanAlasan,
        kerjasamaTimNilai: data.kerjasamaTimNilai,
        kerjasamaTimAlasan: data.kerjasamaTimAlasan,
        komitmenVisiMisiNilai: data.komitmenVisiMisiNilai,
        komitmenVisiMisiAlasan: data.komitmenVisiMisiAlasan,
        pengembanganDiriNilai: data.pengembanganDiriNilai,
        pengembanganDiriAlasan: data.pengembanganDiriAlasan,
        penggunaanTeknologiNilai: data.penggunaanTeknologiNilai,
        penggunaanTeknologiAlasan: data.penggunaanTeknologiAlasan,
        ketaatanKepatuhanNilai: data.ketaatanKepatuhanNilai,
        ketaatanKepatuhanAlasan: data.ketaatanKepatuhanAlasan,
        komunikasiEfektifNilai: data.komunikasiEfektifNilai,
        komunikasiEfektifAlasan: data.komunikasiEfektifAlasan,
        inisiatifProblemSolvingNilai: data.inisiatifProblemSolvingNilai,
        inisiatifProblemSolvingAlasan: data.inisiatifProblemSolvingAlasan,
        jumlah: data.jumlah,
        rataRata: data.rataRata,
        bobot: data.bobot,
      },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "DP3", entityId: dp3.id })
    revalidatePath("/dp3")
    revalidatePath(`/pegawai/${data.employeeId}`)
    return { success: true, id: dp3.id }
  } catch (e: any) {
    console.error("Error creating DP3:", e)
    return { error: "Failed to create DP3", details: e.message }
  }
}

export async function updateDP3(id: string, data: {
  tahunId?: string
  statusDP3Id?: string
  kualitasKerjaNilai?: number
  kualitasKerjaAlasan?: string
  kehadiranDanKedisiplinanNilai?: number
  kehadiranDanKedisiplinanAlasan?: string
  kerjasamaTimNilai?: number
  kerjasamaTimAlasan?: string
  komitmenVisiMisiNilai?: number
  komitmenVisiMisiAlasan?: string
  pengembanganDiriNilai?: number
  pengembanganDiriAlasan?: string
  penggunaanTeknologiNilai?: number
  penggunaanTeknologiAlasan?: string
  ketaatanKepatuhanNilai?: number
  ketaatanKepatuhanAlasan?: string
  komunikasiEfektifNilai?: number
  komunikasiEfektifAlasan?: string
  inisiatifProblemSolvingNilai?: number
  inisiatifProblemSolvingAlasan?: string
  jumlah?: number
  rataRata?: number
  bobot?: number
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }

  try {
    const existing = await prisma.dP3.findUnique({ where: { id } })
    if (!existing) return { error: "DP3 not found" }

    await prisma.dP3.update({
      where: { id },
      data: {
        tahunId: data.tahunId,
        statusDP3Id: data.statusDP3Id,
        kualitasKerjaNilai: data.kualitasKerjaNilai,
        kualitasKerjaAlasan: data.kualitasKerjaAlasan,
        kehadiranDanKedisiplinanNilai: data.kehadiranDanKedisiplinanNilai,
        kehadiranDanKedisiplinanAlasan: data.kehadiranDanKedisiplinanAlasan,
        kerjasamaTimNilai: data.kerjasamaTimNilai,
        kerjasamaTimAlasan: data.kerjasamaTimAlasan,
        komitmenVisiMisiNilai: data.komitmenVisiMisiNilai,
        komitmenVisiMisiAlasan: data.komitmenVisiMisiAlasan,
        pengembanganDiriNilai: data.pengembanganDiriNilai,
        pengembanganDiriAlasan: data.pengembanganDiriAlasan,
        penggunaanTeknologiNilai: data.penggunaanTeknologiNilai,
        penggunaanTeknologiAlasan: data.penggunaanTeknologiAlasan,
        ketaatanKepatuhanNilai: data.ketaatanKepatuhanNilai,
        ketaatanKepatuhanAlasan: data.ketaatanKepatuhanAlasan,
        komunikasiEfektifNilai: data.komunikasiEfektifNilai,
        komunikasiEfektifAlasan: data.komunikasiEfektifAlasan,
        inisiatifProblemSolvingNilai: data.inisiatifProblemSolvingNilai,
        inisiatifProblemSolvingAlasan: data.inisiatifProblemSolvingAlasan,
        jumlah: data.jumlah,
        rataRata: data.rataRata,
        bobot: data.bobot,
      },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "DP3", entityId: id })
    revalidatePath("/dp3")
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    console.error("Error updating DP3:", e)
    return { error: "Failed to update DP3", details: e.message }
  }
}

export async function deleteDP3(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }

  try {
    const existing = await prisma.dP3.findUnique({ where: { id } })
    if (!existing) return { error: "DP3 not found" }

    await prisma.dP3.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "DP3", entityId: id })
    revalidatePath("/dp3")
    revalidatePath(`/pegawai/${existing.employeeId}`)
    return { success: true }
  } catch (e: any) {
    console.error("Error deleting DP3:", e)
    return { error: "Failed to delete DP3", details: e.message }
  }
}

export async function getDP3(employeeId: string) {
  try {
    const dp3 = await prisma.dP3.findMany({
      where: { employeeId },
      include: {
        tahun: true,
        statusDP3: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: dp3 }
  } catch (e: any) {
    return { error: "Failed to fetch DP3" }
  }
}

export async function getAllDP3(filters?: {
  tahunId?: string
  departmentId?: string
}) {
  try {
    const where: any = {}

    if (filters?.tahunId) {
      where.tahunId = filters.tahunId
    } else if (filters?.departmentId) {
      where.employee = {
        departmentId: filters.departmentId,
      }
    }

    const dp3 = await prisma.dP3.findMany({
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
        tahun: true,
        statusDP3: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: dp3 }
  } catch (e: any) {
    return { error: "Failed to fetch DP3" }
  }
}

export async function getEmployeesWithDP3Status(filters?: {
  tahunId?: string
  departmentId?: string
}) {
  try {
    const where: any = {
      employmentStatus: "AKTIF",
    }

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId
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
        dp3: {
          select: {
            id: true,
            tahunId: true,
            statusDP3Id: true,
            kualitasKerjaNilai: true,
            kualitasKerjaAlasan: true,
            kehadiranDanKedisiplinanNilai: true,
            kehadiranDanKedisiplinanAlasan: true,
            kerjasamaTimNilai: true,
            kerjasamaTimAlasan: true,
            komitmenVisiMisiNilai: true,
            komitmenVisiMisiAlasan: true,
            pengembanganDiriNilai: true,
            pengembanganDiriAlasan: true,
            penggunaanTeknologiNilai: true,
            penggunaanTeknologiAlasan: true,
            ketaatanKepatuhanNilai: true,
            ketaatanKepatuhanAlasan: true,
            komunikasiEfektifNilai: true,
            komunikasiEfektifAlasan: true,
            inisiatifProblemSolvingNilai: true,
            inisiatifProblemSolvingAlasan: true,
            jumlah: true,
            rataRata: true,
            bobot: true,
            createdAt: true,
            tahun: {
              select: {
                id: true,
                name: true,
              },
            },
            statusDP3: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { fullName: 'asc' },
    })

    // Filter by tahun if specified
    let filteredEmployees = employees
    if (filters?.tahunId) {
      filteredEmployees = employees.filter((emp: any) =>
        emp.dp3 && emp.dp3.length > 0 && emp.dp3[0].tahunId === filters.tahunId
      )
    }

    return { success: true, data: filteredEmployees }
  } catch (e: any) {
    return { error: "Failed to fetch employees with DP3 status" }
  }
}
