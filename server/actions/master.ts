"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canManageMasterData } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/activity-log"

async function checkPermission() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (!canManageMasterData(session.user.role as Role)) return null
  return session
}

// ── Department ──────────────────────────────────────────────────────────────
export async function createDepartment(data: { code: string; name: string; description?: string }) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  if (!data.code || !data.name) return { error: "Kode dan nama wajib diisi" }
  try {
    const dept = await prisma.department.create({ data })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Department", entityId: dept.id })
    revalidatePath("/master/departemen")
    return { success: true, id: dept.id }
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Kode departemen sudah ada" }
    return { error: "Gagal menyimpan" }
  }
}

export async function updateDepartment(id: string, data: { code: string; name: string; description?: string; isActive?: boolean }) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    await prisma.department.update({ where: { id }, data })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Department", entityId: id })
    revalidatePath("/master/departemen")
    return { success: true }
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Kode departemen sudah ada" }
    return { error: "Gagal memperbarui" }
  }
}

export async function deleteDepartment(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    await prisma.department.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "Department", entityId: id })
    revalidatePath("/master/departemen")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus (mungkin masih digunakan)" }
  }
}

// ── Position ────────────────────────────────────────────────────────────────
export async function createPosition(data: { name: string; description?: string }) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  if (!data.name) return { error: "Nama wajib diisi" }
  try {
    const pos = await prisma.position.create({ data })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Position", entityId: pos.id })
    revalidatePath("/master/jabatan")
    return { success: true, id: pos.id }
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Jabatan sudah ada" }
    return { error: "Gagal menyimpan" }
  }
}

export async function updatePosition(id: string, data: { name: string; description?: string; isActive?: boolean }) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    await prisma.position.update({ where: { id }, data })
    revalidatePath("/master/jabatan")
    return { success: true }
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Jabatan sudah ada" }
    return { error: "Gagal memperbarui" }
  }
}

export async function deletePosition(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    await prisma.position.delete({ where: { id } })
    revalidatePath("/master/jabatan")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus (mungkin masih digunakan)" }
  }
}

// ── EmploymentStatus ─────────────────────────────────────────────────────────
export async function createEmploymentStatus(data: { name: string }) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  if (!data.name) return { error: "Nama wajib diisi" }
  try {
    const s = await prisma.employmentStatusMaster.create({ data })
    revalidatePath("/master/status-kepegawaian")
    return { success: true, id: s.id }
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Status sudah ada" }
    return { error: "Gagal menyimpan" }
  }
}

export async function updateEmploymentStatus(id: string, data: { name: string; isActive?: boolean }) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    await prisma.employmentStatusMaster.update({ where: { id }, data })
    revalidatePath("/master/status-kepegawaian")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui" }
  }
}

export async function deleteEmploymentStatus(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    await prisma.employmentStatusMaster.delete({ where: { id } })
    revalidatePath("/master/status-kepegawaian")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus (mungkin masih digunakan)" }
  }
}

// ── Religion ────────────────────────────────────────────────────────────────
export async function createReligion(data: { name: string }) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    const r = await prisma.religion.create({ data })
    revalidatePath("/master/agama")
    return { success: true, id: r.id }
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Agama sudah ada" }
    return { error: "Gagal menyimpan" }
  }
}

export async function updateReligion(id: string, data: { name: string; isActive?: boolean }) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    await prisma.religion.update({ where: { id }, data })
    revalidatePath("/master/agama")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui" }
  }
}

export async function deleteReligion(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    await prisma.religion.delete({ where: { id } })
    revalidatePath("/master/agama")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus (mungkin masih digunakan)" }
  }
}

// ── BloodType ────────────────────────────────────────────────────────────────
export async function createBloodType(data: { name: string }) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    const b = await prisma.bloodType.create({ data })
    revalidatePath("/master/golongan-darah")
    return { success: true, id: b.id }
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Golongan darah sudah ada" }
    return { error: "Gagal menyimpan" }
  }
}

export async function updateBloodType(id: string, data: { name: string; isActive?: boolean }) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    await prisma.bloodType.update({ where: { id }, data })
    revalidatePath("/master/golongan-darah")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui" }
  }
}

export async function deleteBloodType(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    await prisma.bloodType.delete({ where: { id } })
    revalidatePath("/master/golongan-darah")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus (mungkin masih digunakan)" }
  }
}

// ── Education ────────────────────────────────────────────────────────────────
export async function createEducation(data: { name: string; level: string }) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  if (!data.name || !data.level) return { error: "Nama dan level wajib diisi" }
  try {
    const edu = await prisma.education.create({ data })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Education", entityId: edu.id })
    revalidatePath("/master/pendidikan")
    return { success: true, id: edu.id }
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Nama pendidikan sudah ada" }
    return { error: "Gagal menyimpan" }
  }
}

export async function updateEducation(id: string, data: { name: string; level: string; isActive?: boolean }) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    await prisma.education.update({ where: { id }, data })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Education", entityId: id })
    revalidatePath("/master/pendidikan")
    return { success: true }
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Nama pendidikan sudah ada" }
    return { error: "Gagal memperbarui" }
  }
}

export async function deleteEducation(id: string) {
  const session = await checkPermission()
  if (!session) return { error: "Akses ditolak" }
  try {
    await prisma.education.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "Education", entityId: id })
    revalidatePath("/master/pendidikan")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus (mungkin masih digunakan)" }
  }
}

// ── Occupation ─────────────────────────────────────────────────────────────

export async function createOccupation(data: { name: string; order: number }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!canManageMasterData(session.user.role as Role)) return { error: "Access denied" }
  if (!data.name) return { error: "Name is required" }

  try {
    const occupation = await prisma.occupation.create({
      data: { name: data.name, order: data.order },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Occupation", entityId: occupation.id })
    revalidatePath("/master/pekerjaan")
    return { success: true, id: occupation.id }
  } catch {
    return { error: "Gagal menambahkan pekerjaan" }
  }
}

export async function updateOccupation(id: string, data: { name: string; order: number; isActive: boolean }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!canManageMasterData(session.user.role as Role)) return { error: "Access denied" }
  if (!data.name) return { error: "Name is required" }

  try {
    await prisma.occupation.update({
      where: { id },
      data: { name: data.name, order: data.order, isActive: data.isActive },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Occupation", entityId: id })
    revalidatePath("/master/pekerjaan")
    return { success: true }
  } catch {
    return { error: "Gagal mengupdate pekerjaan" }
  }
}

export async function deleteOccupation(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!canManageMasterData(session.user.role as Role)) return { error: "Access denied" }

  try {
    await prisma.occupation.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "Occupation", entityId: id })
    revalidatePath("/master/pekerjaan")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus (mungkin masih digunakan)" }
  }
}

// ── Year ────────────────────────────────────────────────────────────────

export async function createYear(data: { name: string; order: number }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!canManageMasterData(session.user.role as Role)) return { error: "Access denied" }
  if (!data.name) return { error: "Name is required" }

  try {
    const year = await prisma.year.create({
      data: { name: data.name, order: data.order },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Year", entityId: year.id })
    revalidatePath("/master/tahun")
    return { success: true, id: year.id }
  } catch {
    return { error: "Gagal menambahkan tahun" }
  }
}

export async function updateYear(id: string, data: { name: string; order: number; isActive: boolean }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!canManageMasterData(session.user.role as Role)) return { error: "Access denied" }
  if (!data.name) return { error: "Name is required" }

  try {
    await prisma.year.update({
      where: { id },
      data: { name: data.name, order: data.order, isActive: data.isActive },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Year", entityId: id })
    revalidatePath("/master/tahun")
    return { success: true }
  } catch {
    return { error: "Gagal mengupdate tahun" }
  }
}

export async function deleteYear(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!canManageMasterData(session.user.role as Role)) return { error: "Access denied" }

  try {
    await prisma.year.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "Year", entityId: id })
    revalidatePath("/master/tahun")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus (mungkin masih digunakan)" }
  }
}

// ── StatusDP3 ─────────────────────────────────────────────────────────────

export async function createStatusDP3(data: { name: string; order: number }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!canManageMasterData(session.user.role as Role)) return { error: "Access denied" }
  if (!data.name) return { error: "Name is required" }

  try {
    const statusDP3 = await prisma.statusDP3.create({
      data: { name: data.name, order: data.order },
    })
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "StatusDP3", entityId: statusDP3.id })
    revalidatePath("/master/status-dp3")
    return { success: true, id: statusDP3.id }
  } catch {
    return { error: "Gagal menambahkan status DP3" }
  }
}

export async function updateStatusDP3(id: string, data: { name: string; order: number; isActive: boolean }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!canManageMasterData(session.user.role as Role)) return { error: "Access denied" }
  if (!data.name) return { error: "Name is required" }

  try {
    await prisma.statusDP3.update({
      where: { id },
      data: { name: data.name, order: data.order, isActive: data.isActive },
    })
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "StatusDP3", entityId: id })
    revalidatePath("/master/status-dp3")
    return { success: true }
  } catch {
    return { error: "Gagal mengupdate status DP3" }
  }
}

export async function deleteStatusDP3(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (!canManageMasterData(session.user.role as Role)) return { error: "Access denied" }

  try {
    await prisma.statusDP3.delete({ where: { id } })
    await logActivity({ userId: session.user.id, action: "DELETE", entity: "StatusDP3", entityId: id })
    revalidatePath("/master/status-dp3")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus (mungkin masih digunakan)" }
  }
}
