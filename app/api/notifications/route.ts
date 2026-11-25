import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/** GET /api/notifications — untuk polling badge count di topbar */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ unreadCount: 0, notifications: [] })
  }

  const [unreadCount, notifications] = await Promise.all([
    prisma.notification.count({
      where: { userId: session.user.id, readAt: null },
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        link: true,
        readAt: true,
        createdAt: true,
      },
    }),
  ])

  return NextResponse.json({ unreadCount, notifications })
}
