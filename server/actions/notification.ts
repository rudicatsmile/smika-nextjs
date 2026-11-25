"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ERROR"

export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Server Actions
// ─────────────────────────────────────────────────────────────────────────────

/** Ambil notifikasi milik session user */
export async function getMyNotifications(limit = 20) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { notifications: [], unreadCount: 0 }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({
      where: { userId: session.user.id, readAt: null },
    }),
  ])

  return { notifications, unreadCount }
}

/** Tandai semua notifikasi sebagai sudah dibaca */
export async function markAllNotificationsRead() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  })

  revalidatePath("/notifikasi")
  return { success: true }
}

/** Tandai satu notifikasi sebagai sudah dibaca */
export async function markNotificationRead(notificationId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false }

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { readAt: new Date() },
  })

  revalidatePath("/notifikasi")
  return { success: true }
}

/** Hapus satu notifikasi */
export async function deleteNotification(notificationId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false }

  await prisma.notification.deleteMany({
    where: { id: notificationId, userId: session.user.id },
  })

  revalidatePath("/notifikasi")
  return { success: true }
}

/** Hapus semua notifikasi yang sudah dibaca */
export async function clearReadNotifications() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false }

  await prisma.notification.deleteMany({
    where: { userId: session.user.id, readAt: { not: null } },
  })

  revalidatePath("/notifikasi")
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper (panggil dari server-side, bukan dari client)
// ─────────────────────────────────────────────────────────────────────────────
export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
    },
  })
}

/** Kirim notifikasi ke semua user aktif (broadcast) */
export async function broadcastNotification(
  input: Omit<CreateNotificationInput, "userId">,
  roleFilter?: string[]
) {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      ...(roleFilter ? { role: { in: roleFilter as any[] } } : {}),
    },
    select: { id: true },
  })

  if (users.length === 0) return

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
    })),
  })
}
