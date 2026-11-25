"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  BellRing,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { id as localeId } from "date-fns/locale"

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  readAt?: string | Date | null
  createdAt: string | Date
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  INFO: <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />,
  WARNING: <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />,
  SUCCESS: <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />,
  ERROR: <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />,
}

const TYPE_BG: Record<string, string> = {
  INFO: "bg-blue-50 dark:bg-blue-950/30",
  WARNING: "bg-amber-50 dark:bg-amber-950/30",
  SUCCESS: "bg-green-50 dark:bg-green-950/30",
  ERROR: "bg-red-50 dark:bg-red-950/30",
}

export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setUnreadCount(data.unreadCount ?? 0)
      setNotifications(data.notifications ?? [])
    } catch {
      // silent
    }
  }, [])

  // Polling setiap 30 detik
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Refresh saat dropdown dibuka
  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  const handleMarkAllRead = async () => {
    setLoading(true)
    try {
      await fetch("/api/notifications/read", { method: "POST" })
      await fetchNotifications()
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (val: boolean) => {
    setOpen(val)
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground relative"
          aria-label="Notifikasi"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4 animate-pulse" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <span className="text-sm font-semibold">Notifikasi</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {unreadCount} belum dibaca
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              Tandai semua
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">Tidak ada notifikasi</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-muted/50",
                  !n.readAt && TYPE_BG[n.type] || ""
                )}
                onClick={() => {
                  if (n.link) {
                    setOpen(false)
                    startTransition(() => router.push(n.link!))
                  }
                }}
              >
                <div className="mt-0.5">
                  {TYPE_ICONS[n.type] ?? <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className={cn("text-xs font-semibold leading-tight truncate", !n.readAt && "text-foreground", n.readAt && "text-muted-foreground")}>
                      {n.title}
                    </p>
                    {!n.readAt && (
                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: localeId })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2">
          <Link
            href="/notifikasi"
            className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
            onClick={() => setOpen(false)}
          >
            Lihat semua notifikasi
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
