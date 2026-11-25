"use client"

import Link from "next/link"
import {
  User,
  QrCode,
  Printer,
  FilePenLine,
  Upload,
  Bell,
  ClipboardCheck,
  Handshake,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  GraduationCap,
  Award,
  FileText,
  ChevronRight,
  AlertCircle,
  KeyRound,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { COMPLETENESS_ITEMS, EmployeeCompletenessRow } from "@/lib/document-completeness"
import { format, formatDistanceToNow } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface PortalClientProps {
  userName: string
  employee: {
    id: string
    fullName: string
    employeeIdNumber: string
    profilePhoto: string | null
    employmentStatus: string
    employmentStatusLabel: string
    departmentName: string
    positionName: string
    joinDate: string | null
    email: string | null
    phoneNumber: string | null
    counts: {
      educationHistories: number
      trainings: number
      certifications: number
      employmentDocuments: number
    }
    latestKesediaan: {
      tanggal: string
      isBersedia: boolean
    } | null
    dp3History: Array<{
      id: string
      tahun: string
      status: string
      rataRata: number
      jumlah: number
    }>
  } | null
  completeness: EmployeeCompletenessRow | null
  notifications: Array<{
    id: string
    type: string
    title: string
    message: string
    link: string | null
    readAt: string | null
    createdAt: string
  }>
  unreadNotifCount: number
  correctionRequests: Array<{
    id: string
    fieldLabel: string
    newValue: string
    status: "PENDING" | "APPROVED" | "REJECTED"
    createdAt: string
  }>
  activityLogs: Array<{
    id: string
    action: string
    entity: string
    actorName: string
    createdAt: string
  }>
}

const CORRECTION_BADGE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
}

export function PortalClient({
  userName,
  employee,
  completeness,
  notifications,
  unreadNotifCount,
  correctionRequests,
  activityLogs,
}: PortalClientProps) {
  if (!employee) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3 text-muted-foreground">
          <AlertCircle className="h-10 w-10 mx-auto opacity-40" />
          <p className="font-medium text-foreground">
            Akun ({userName}) belum terhubung dengan profil pegawai
          </p>
          <p className="text-sm">
            Hubungi administrator untuk menghubungkan akun Anda agar dapat mengakses Portal Pegawai.
          </p>
        </CardContent>
      </Card>
    )
  }

  const initials = employee.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const latestDp3 = employee.dp3History[0]
  const pendingCorrections = correctionRequests.filter((c) => c.status === "PENDING").length

  return (
    <div className="space-y-6">
      {/* Header Profil Hero */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="h-2 bg-gradient-to-r from-primary via-emerald-600 to-blue-600" />
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-background shadow">
                {employee.profilePhoto && (
                  <AvatarImage
                    src={employee.profilePhoto}
                    alt={employee.fullName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {employee.fullName}
                  </h1>
                  <Badge
                    variant="secondary"
                    className={
                      employee.employmentStatus === "AKTIF"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }
                  >
                    {employee.employmentStatusLabel}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {employee.positionName} · {employee.departmentName}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  NIP: {employee.employeeIdNumber}
                  {employee.joinDate
                    ? ` · Bergabung ${format(new Date(employee.joinDate), "dd MMM yyyy", {
                        locale: localeId,
                      })}`
                    : ""}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="default">
                <Link href={`/pegawai/${employee.id}`}>
                  <User className="h-4 w-4 mr-1.5" />
                  Profil Lengkap
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/pegawai/${employee.id}/kartu`}>
                  <QrCode className="h-4 w-4 mr-1.5" />
                  Kartu ID &amp; QR
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/pegawai/${employee.id}/cv`}>
                  <Printer className="h-4 w-4 mr-1.5" />
                  Cetak CV PDF
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/pengajuan-koreksi">
                  <FilePenLine className="h-4 w-4 mr-1.5" />
                  Koreksi Data
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/ganti-password">
                  <KeyRound className="h-4 w-4 mr-1.5" />
                  Ganti Password
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ringkasan 4 Kartu */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-blue-100 dark:bg-blue-900/30">
              <Upload className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">
                {completeness?.percentage ?? 0}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Berkas ({completeness?.filledCount ?? 0}/{completeness?.totalCount ?? 8})
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-amber-100 dark:bg-amber-900/30">
              <Bell className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{unreadNotifCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Notifikasi Belum Dibaca</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-green-100 dark:bg-green-900/30">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">
                {latestDp3 ? latestDp3.rataRata : "-"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {latestDp3 ? `DP3 ${latestDp3.tahun}` : "Belum Ada DP3"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-purple-100 dark:bg-purple-900/30">
              <FilePenLine className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{pendingCorrections}</p>
              <p className="text-xs text-muted-foreground mt-1">Koreksi Menunggu HR</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Utama */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Kelengkapan Berkas */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Kelengkapan Berkas Pribadi</CardTitle>
              <CardDescription>Status dokumen wajib &amp; identitas kepegawaian</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="h-8 text-xs">
              <Link href="/data-dokumen-penting">Lengkapi</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {completeness && (
              <>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>
                      {completeness.filledCount} dari {completeness.totalCount} item lengkap
                    </span>
                    <span>{completeness.percentage}%</span>
                  </div>
                  <Progress value={completeness.percentage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COMPLETENESS_ITEMS.map((item) => {
                    const ok = completeness.checks[item.key]
                    return (
                      <div
                        key={item.key}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium",
                          ok
                            ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400"
                            : "bg-red-50/60 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
                        )}
                      >
                        {ok ? (
                          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
                        <span>{item.label}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-center">
              <Link
                href={`/pegawai/${employee.id}?tab=pendidikan`}
                className="rounded-lg p-2 hover:bg-muted/50 transition-colors"
              >
                <GraduationCap className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-bold">{employee.counts.educationHistories}</p>
                <p className="text-[11px] text-muted-foreground">Pendidikan</p>
              </Link>
              <Link
                href={`/pegawai/${employee.id}?tab=pelatihan`}
                className="rounded-lg p-2 hover:bg-muted/50 transition-colors"
              >
                <Award className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-bold">{employee.counts.trainings}</p>
                <p className="text-[11px] text-muted-foreground">Pelatihan</p>
              </Link>
              <Link
                href={`/pegawai/${employee.id}?tab=sertifikasi`}
                className="rounded-lg p-2 hover:bg-muted/50 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-bold">{employee.counts.certifications}</p>
                <p className="text-[11px] text-muted-foreground">Sertifikasi</p>
              </Link>
              <Link
                href={`/pegawai/${employee.id}?tab=riwayat-kepegawaian`}
                className="rounded-lg p-2 hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-bold">{employee.counts.employmentDocuments}</p>
                <p className="text-[11px] text-muted-foreground">Riwayat SK</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Notifikasi Terbaru */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Notifikasi Terbaru</CardTitle>
              <CardDescription>Pemberitahuan sistem &amp; hasil verifikasi HR</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
              <Link href="/notifikasi">
                Semua <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada notifikasi masuk.
              </p>
            ) : (
              <div className="divide-y">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {!n.readAt && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                        <p className="text-xs font-semibold truncate">{n.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                        locale: localeId,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evaluasi DP3 & Kesediaan */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Evaluasi Kinerja &amp; Kesediaan</CardTitle>
              <CardDescription>Riwayat penilaian DP3 dan kesiapan mengajar</CardDescription>
            </div>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                <Link href="/kesediaan">
                  <Handshake className="h-3.5 w-3.5 mr-1" />
                  Kesediaan
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                <Link href="/dp3">DP3</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3 bg-muted/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Form Kesediaan Mengajar Terakhir
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {employee.latestKesediaan
                    ? employee.latestKesediaan.isBersedia
                      ? "Bersedia Mengajar"
                      : "Tidak Bersedia"
                    : "Belum Pernah Mengisi"}
                </p>
              </div>
              {employee.latestKesediaan && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(employee.latestKesediaan.tanggal), "dd MMM yyyy", {
                    locale: localeId,
                  })}
                </span>
              )}
            </div>

            {employee.dp3History.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Belum ada catatan penilaian DP3.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Riwayat Nilai DP3</p>
                {employee.dp3History.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                  >
                    <div>
                      <span className="font-semibold">Tahun {d.tahun}</span>
                      <span className="text-muted-foreground ml-2">· {d.status}</span>
                    </div>
                    <Badge variant="secondary" className="font-bold">
                      Rata-rata: {d.rataRata}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pengajuan Koreksi & Log Aktivitas */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Riwayat Koreksi &amp; Aktivitas
              </CardTitle>
              <CardDescription>Pengajuan perubahan data &amp; log aktivitas terbaru</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
              <Link href="/pengajuan-koreksi">
                Koreksi <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {correctionRequests.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Pengajuan Koreksi Terakhir</p>
                {correctionRequests.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-xs gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.fieldLabel}</p>
                      <p className="text-muted-foreground truncate">Usulan: {c.newValue}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px] flex-shrink-0", CORRECTION_BADGE[c.status])}
                    >
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Log Aktivitas Akun</p>
              {activityLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3 text-center">
                  Belum ada aktivitas tercatat.
                </p>
              ) : (
                <div className="divide-y">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="py-1.5 flex items-center justify-between text-xs gap-2">
                      <div className="min-w-0 flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">
                          <span className="font-medium">{log.action}</span> · {log.entity}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                          locale: localeId,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
