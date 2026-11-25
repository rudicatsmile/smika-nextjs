import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NotifikasiClient } from "./notifikasi-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function NotifikasiPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <NotifikasiClient
        initialNotifications={notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          readAt: n.readAt?.toISOString() ?? null,
          createdAt: n.createdAt.toISOString(),
        }))}
        initialUnreadCount={unreadCount}
      />
    </div>
  )
}
