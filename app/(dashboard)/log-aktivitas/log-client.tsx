"use client"

import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Activity } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { ROLE_COLORS, ROLE_LABELS } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  BLOCK: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  UNBLOCK: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  CREATE_USER: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  UPDATE_ROLE: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  RESET_PASSWORD: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  DELETE_USER: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
}

interface Log {
  id: string; action: string; actionLabel: string; entity: string
  entityId?: string | null; meta?: any; createdAt: Date | string
  user: { name: string; role: string }
}

export function LogClient({ logs, total, page, limit }: {
  logs: Log[]; total: number; page: number; limit: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const totalPages = Math.ceil(total / limit)

  const goPage = (p: number) => router.push(`${pathname}?page=${p}`)

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Belum ada aktivitas tercatat</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Waktu</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pengguna</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Entitas</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.createdAt), "d MMM yyyy HH:mm", { locale: id })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{log.user.name}</p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${ROLE_COLORS[log.user.role as Role] ?? "bg-muted"}`}
                        >
                          {ROLE_LABELS[log.user.role as Role] ?? log.user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground"}
                        >
                          {log.actionLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-muted-foreground">{log.entity}</p>
                        {log.entityId && (
                          <p className="text-xs text-muted-foreground/60 font-mono">{log.entityId.slice(0, 8)}…</p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {log.meta?.name && (
                          <p className="text-sm text-muted-foreground">{log.meta.name}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages} ({total} entri)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
