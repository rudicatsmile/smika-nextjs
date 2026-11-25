"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  CheckCheck,
  Trash2,
  Loader2,
  Filter,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import {
  markAllNotificationsRead,
  deleteNotification,
  markNotificationRead,
  clearReadNotifications,
} from "@/server/actions/notification"
import Link from "next/link"

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  readAt?: string | null
  createdAt: string
}

interface NotifikasiClientProps {
  initialNotifications: NotificationItem[]
  initialUnreadCount: number
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  INFO: <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />,
  WARNING: <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />,
  SUCCESS: <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />,
  ERROR: <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />,
}

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  INFO: { label: "Info", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  WARNING: { label: "Peringatan", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  SUCCESS: { label: "Berhasil", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  ERROR: { label: "Error", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
}

const LEFT_BORDER: Record<string, string> = {
  INFO: "border-l-4 border-l-blue-500",
  WARNING: "border-l-4 border-l-amber-500",
  SUCCESS: "border-l-4 border-l-green-500",
  ERROR: "border-l-4 border-l-red-500",
}

type TabValue = "semua" | "belum-dibaca" | "sudah-dibaca"

export function NotifikasiClient({ initialNotifications, initialUnreadCount }: NotifikasiClientProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [tab, setTab] = useState<TabValue>("semua")
  const [isPending, startTransition] = useTransition()

  const filtered = notifications.filter((n) => {
    if (tab === "belum-dibaca") return !n.readAt
    if (tab === "sudah-dibaca") return !!n.readAt
    return true
  })

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsRead()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
      )
      setUnreadCount(0)
    })
  }

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteNotification(id)
      const deleted = notifications.find((n) => n.id === id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      if (deleted && !deleted.readAt) setUnreadCount((c) => Math.max(0, c - 1))
    })
  }

  const handleClearRead = () => {
    startTransition(async () => {
      await clearReadNotifications()
      setNotifications((prev) => prev.filter((n) => !n.readAt))
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Pusat Notifikasi
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : "Semua notifikasi sudah dibaca"}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="text-xs"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCheck className="h-3 w-3 mr-1" />}
              Tandai Semua Dibaca
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearRead}
            disabled={isPending}
            className="text-xs text-muted-foreground"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Hapus Sudah Dibaca
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="semua" className="flex-1 sm:flex-none">
            Semua
            <Badge variant="secondary" className="ml-1 text-[10px]">{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="belum-dibaca" className="flex-1 sm:flex-none">
            Belum Dibaca
            {unreadCount > 0 && (
              <Badge className="ml-1 text-[10px] bg-red-500 text-white hover:bg-red-500">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sudah-dibaca" className="flex-1 sm:flex-none">
            Sudah Dibaca
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notification List */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-medium">Tidak ada notifikasi</p>
              <p className="text-sm mt-1">
                {tab === "belum-dibaca"
                  ? "Semua notifikasi sudah dibaca"
                  : tab === "sudah-dibaca"
                  ? "Belum ada notifikasi yang dibaca"
                  : "Belum ada notifikasi masuk"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-4 p-4 transition-colors",
                    LEFT_BORDER[n.type] ?? "border-l-4 border-l-muted",
                    !n.readAt && "bg-muted/30 dark:bg-muted/10"
                  )}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {TYPE_ICONS[n.type] ?? <Info className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded",
                        TYPE_LABEL[n.type]?.color ?? "bg-muted text-muted-foreground"
                      )}>
                        {TYPE_LABEL[n.type]?.label ?? n.type}
                      </span>
                      {!n.readAt && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: localeId })}
                      </span>
                    </div>
                    <p className={cn("font-semibold text-sm", n.readAt && "text-muted-foreground font-medium")}>
                      {n.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {format(new Date(n.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                    </p>
                    {n.link && (
                      <Link
                        href={n.link}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                        onClick={() => !n.readAt && handleMarkRead(n.id)}
                      >
                        Lihat detail <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {!n.readAt && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Tandai dibaca"
                        onClick={() => handleMarkRead(n.id)}
                        disabled={isPending}
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      title="Hapus"
                      onClick={() => handleDelete(n.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
