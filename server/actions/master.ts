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
