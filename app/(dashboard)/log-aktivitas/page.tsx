import { prisma } from "@/lib/prisma"
import { LogClient } from "./log-client"

export const dynamic = "force-dynamic"

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Tambah Pegawai", UPDATE: "Ubah Pegawai", DELETE: "Hapus Pegawai",
  BLOCK: "Blokir Pegawai", UNBLOCK: "Buka Blokir",
  CREATE_USER: "Tambah Akun", UPDATE_ROLE: "Ubah Role", RESET_PASSWORD: "Reset Password",
  DELETE_USER: "Hapus Akun",
}

export default async function LogAktivitasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = parseInt(sp.page ?? "1")
  const limit = 20

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: { user: { select: { name: true, role: true } } },
  })

  const total = await prisma.activityLog.count()

  const formatted = logs.map((log) => ({
    ...log,
    actionLabel: ACTION_LABELS[log.action] ?? log.action,
    meta: log.meta ? JSON.parse(log.meta) : null,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Log Aktivitas</h1>
        <p className="text-muted-foreground text-sm">Rekam jejak semua aktivitas pengguna di sistem</p>
      </div>
      <LogClient logs={formatted} total={total} page={page} limit={limit} />
    </div>
  )
}
