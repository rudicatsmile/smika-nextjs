"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canManageUsers } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { logActivity } from "@/lib/activity-log"

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (!canManageUsers(session.user.role as Role)) return null
  return session
}

export async function createUser(data: {
  name: string; email?: string; nip?: string;
  password: string; role: Role; employeeId?: string
}) {
  const session = await checkAdmin()
  if (!session) return { error: "Akses ditolak" }
  if (!data.name || !data.password) return { error: "Nama dan password wajib diisi" }
  if (!data.email && !data.nip) return { error: "Email atau NIP wajib diisi" }

  try {
    const passwordHash = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email || null,
        nip: data.nip || null,
        passwordHash,
        role: data.role,
        employeeId: data.employeeId || null,
      },
    })
    await logActivity({ userId: session.user.id, action: "CREATE_USER", entity: "User", entityId: user.id })
    revalidatePath("/akun")
    return { success: true, id: user.id }
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Email atau NIP sudah digunakan" }
    return { error: "Gagal membuat akun" }
  }
}

export async function updateUserRole(id: string, role: Role) {
  const session = await checkAdmin()
  if (!session) return { error: "Akses ditolak" }
  await prisma.user.update({ where: { id }, data: { role } })
  await logActivity({ userId: session.user.id, action: "UPDATE_ROLE", entity: "User", entityId: id })
  revalidatePath("/akun")
  return { success: true }
}

export async function toggleUserActive(id: string, isActive: boolean) {
  const session = await checkAdmin()
  if (!session) return { error: "Akses ditolak" }
  await prisma.user.update({ where: { id }, data: { isActive } })
  revalidatePath("/akun")
  return { success: true }
}

export async function resetUserPassword(id: string, newPassword: string) {
  const session = await checkAdmin()
  if (!session) return { error: "Akses ditolak" }
  if (newPassword.length < 6) return { error: "Password minimal 6 karakter" }
  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id }, data: { passwordHash } })
  await logActivity({ userId: session.user.id, action: "RESET_PASSWORD", entity: "User", entityId: id })
  revalidatePath("/akun")
  return { success: true }
}

export async function deleteUser(id: string) {
  const session = await checkAdmin()
  if (!session) return { error: "Akses ditolak" }
  await prisma.user.delete({ where: { id } })
  await logActivity({ userId: session.user.id, action: "DELETE_USER", entity: "User", entityId: id })
  revalidatePath("/akun")
  return { success: true }
}
