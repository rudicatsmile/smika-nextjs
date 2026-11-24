"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  TrendingUp,
  ShieldCheck,
  FileText,
  ClipboardCheck,
  Handshake,
  KeyRound,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  ArrowRight,
  Settings,
  SlidersHorizontal,
  GraduationCap,
  Award,
  Heart,
  BarChart3,
  BookOpen,
  Activity,
  Layers,
  ChevronRight,
  Database,
  Check,
  X,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { UserRoleCategory } from "@/lib/role-category"
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"
import { cn } from "@/lib/utils"

interface UserInfo {
  name: string
  nip: string | null
  role: string
  employeeId: string | null
}

const GENDER_COLORS = ["#166534", "#ca8a04"]
const STATUS_COLORS: Record<string, string> = {
  AKTIF: "#166534",
  NON_AKTIF: "#dc2626",
  CUTI: "#ca8a04",
  PENSIUN: "#6b7280",
}

const STATUS_LABELS: Record<string, string> = {
  AKTIF: "Aktif",
  NON_AKTIF: "Non Aktif",
  CUTI: "Cuti",
  PENSIUN: "Pensiun",
}

const PIE_RADIAN = Math.PI / 180

function renderCustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * PIE_RADIAN)
  const y = cy + radius * Math.sin(-midAngle * PIE_RADIAN)
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null
}

export function DashboardClient({
  roleCategory,
  user,
  data,
}: {
  roleCategory: UserRoleCategory
  user: UserInfo
  data: any
}) {
  switch (roleCategory) {
    case "PEGAWAI":
      return <PegawaiDashboardView user={user} data={data} />
    case "ADMIN_UNIT":
      return <AdminUnitDashboardView user={user} data={data} />
    case "PIMPINAN":
      return <PimpinanDashboardView user={user} data={data} />
    case "SUPER_ADMIN":
      return <SuperAdminDashboardView user={user} data={data} />
    case "PEMILIK_YAYASAN":
      return <PemilikYayasanDashboardView user={user} data={data} />
    case "HR_PUSAT":
    default:
      return <HrPusatDashboardView user={user} data={data} />
  }
}

// =============================================================================
// 1. VIEW: PEGAWAI (Dashboard Personal / Layanan Mandiri)
// =============================================================================
function PegawaiDashboardView({ user, data }: { user: UserInfo; data: any }) {
  const emp = data?.employee
  const docs = emp?.importantDocuments || []
  const validDocsCount = docs.filter((d: any) => d.fileUrl).length
  const totalDocsCount = 7
  const docPercentage = Math.round((validDocsCount / totalDocsCount) * 100)

  const latestKesediaan = emp?.kesediaan?.[0]
  const latestDP3 = emp?.dp3?.[0]

  const docTypes = [
    { key: "KTP", label: "KTP" },
    { key: "KARTU_KELUARGA", label: "Kartu Keluarga" },
    { key: "IJAZAH", label: "Ijazah" },
    { key: "NPWP", label: "NPWP" },
    { key: "BPJS", label: "BPJS" },
    { key: "SERTIFIKASI_PENDIDIKAN", label: "Serdik" },
    { key: "SK_PENGANGKATAN", label: "SK Yayasan" },
  ]

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  // Hitung masa kerja
  let masaKerjaText = "Pegawai Baru"
  if (emp?.joinDate) {
    const join = new Date(emp.joinDate)
    const now = new Date()
    const years = now.getFullYear() - join.getFullYear()
    const months = now.getMonth() - join.getMonth()
    const totalMonths = years * 12 + months
    const y = Math.floor(totalMonths / 12)
    const m = totalMonths % 12
    if (y > 0 && m > 0) masaKerjaText = `${y} Thn ${m} Bln`
    else if (y > 0) masaKerjaText = `${y} Tahun`
    else if (m > 0) masaKerjaText = `${m} Bulan`
  }

  return (
    <div className="space-y-6">
      {/* 1. Hero Profile Banner */}
      <Card className="rounded-2xl border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-2xs overflow-hidden">
        <CardContent className="p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-primary/20 shadow-xs flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl sm:text-2xl rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
                    Selamat Datang, {user.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                    NIP: {user.nip || emp?.employeeIdNumber || "-"}
                  </p>
                </div>
                <Badge variant="outline" className="self-center sm:self-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold px-2.5 py-1">
                  Status: {emp?.employmentStatus ?? "AKTIF"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  {emp?.department?.name ?? "Unit Yayasan"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  {emp?.position?.name ?? "Tenaga Pendidik / Staf"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Masa Kerja: {masaKerjaText}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Empat KPI Personal Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Dokumen Penting */}
        <Link href="/data-dokumen-penting" className="group">
          <Card className="rounded-2xl border-border bg-card shadow-2xs hover:border-primary/50 transition duration-200 h-full">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Dokumen Penting
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                  {validDocsCount} / {totalDocsCount}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {docPercentage}% Terupload
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Upload className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* KPI 2: Form Kesediaan */}
        <Link href="/kesediaan" className="group">
          <Card className="rounded-2xl border-border bg-card shadow-2xs hover:border-primary/50 transition duration-200 h-full">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Form Kesediaan
                </p>
                <p className="text-sm sm:text-base font-bold text-foreground mt-1.5">
                  {latestKesediaan ? (
                    latestKesediaan.isBersedia ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Siap Mengajar
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">Tidak Bersedia</span>
                    )
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> Belum Mengisi
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {latestKesediaan ? "Tahun Ajaran Aktif" : "Perlu Diisi Segera"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Handshake className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* KPI 3: Penilaian DP3 Terakhir */}
        <Link href="/dp3" className="group">
          <Card className="rounded-2xl border-border bg-card shadow-2xs hover:border-primary/50 transition duration-200 h-full">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Nilai DP3 Terakhir
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                  {latestDP3?.rataRata ? (
                    <span>{latestDP3.rataRata}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground font-normal">Belum Dinilai</span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {latestDP3?.tahun?.name ? `Tahun ${latestDP3.tahun.name}` : "Evaluasi Kinerja"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* KPI 4: Masa Pengabdian */}
        <Card className="rounded-2xl border-border bg-card shadow-2xs h-full">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Masa Pengabdian
              </p>
              <p className="text-lg sm:text-xl font-bold text-foreground mt-1 truncate">
                {masaKerjaText}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Al Wathoniyah Asshodriyah 9
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Progres 7 Dokumen Penting Pegawai */}
      <Card className="rounded-2xl border-border shadow-2xs">
        <CardHeader className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Kelengkapan Berkas Dokumen Penting</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Status 7 berkas legalitas dan arsip digital Anda di yayasan.
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="text-xs h-8 rounded-xl gap-1">
            <Link href="/data-dokumen-penting">
              <span>Buka Dokumen</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {docTypes.map((docType) => {
              const uploaded = docs.find((d: any) => d.documentType === docType.key && d.fileUrl)
              return (
                <div
                  key={docType.key}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col justify-between transition-all",
                    uploaded
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-dashed border-border bg-muted/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground truncate">{docType.label}</span>
                    {uploaded ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      uploaded ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    )}
                  >
                    {uploaded ? "Tersimpan" : "Belum Ada"}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Banner Form Kesediaan Mengajar */}
      {!latestKesediaan && (
        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Pengisian Form Kesediaan Mengajar
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mohon lengkapi formulir kesediaan jam dan hari mengajar Anda untuk perencanaan semester baru.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="rounded-xl text-xs h-9 gap-1.5 flex-shrink-0">
            <Link href="/kesediaan">
              <span>Isi Form Kesediaan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* 5. Pintasan Layanan Mandiri Pegawai */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href={user.employeeId ? `/pegawai/${user.employeeId}` : "/pegawai"}
          className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary/50 transition flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground group-hover:text-primary transition truncate">
              Profil Saya
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Biodata & SK</p>
          </div>
        </Link>

        <Link
          href="/ganti-password"
          className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary/50 transition flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <KeyRound className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground group-hover:text-primary transition truncate">
              Ganti Password
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Keamanan Akun</p>
          </div>
        </Link>

        <Link
          href="/data-dokumen-penting"
          className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary/50 transition flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Upload className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground group-hover:text-primary transition truncate">
              Dokumen Penting
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Upload & Cek</p>
          </div>
        </Link>

        <Link
          href="/kesediaan"
          className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary/50 transition flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Handshake className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground group-hover:text-primary transition truncate">
              Form Kesediaan
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Beban Mengajar</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

// =============================================================================
// 2. VIEW: ADMIN UNIT LEMBAGA (Scoped Unit Operations & Analytics)
// =============================================================================
function AdminUnitDashboardView({ user, data }: { user: UserInfo; data: any }) {
  const deptName = data?.department?.name ?? "Unit Lembaga Sekolah"
  const missingDocs = data?.missingDocsStaff || []
  const missingKesediaan = data?.missingKesediaanStaff || []

  return (
    <div className="space-y-6">
      {/* Header Unit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold px-2 py-0.5">
              Admin Unit
            </Badge>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Dashboard Kepegawaian {deptName}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Data operasional, kelengkapan berkas, dan evaluasi guru internal {deptName}.
          </p>
        </div>
      </div>

      {/* 4 KPI Scoped Unit */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Total Guru & Staf
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                {data.totalUnit} Orang
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {data.aktifUnit} Aktif
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Berkas Lengkap (100%)
              </p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {data.completeDocsCount} Guru
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {data.partialDocsCount} Sebagian Diupload
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Kesediaan Mengajar
              </p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {data.submittedKesediaanCount} / {data.totalUnit}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {data.totalUnit > 0 ? Math.round((data.submittedKesediaanCount / data.totalUnit) * 100) : 0}% Terdata
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Handshake className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Penilaian DP3 Unit
              </p>
              <p className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                {data.assessedDP3Count} / {data.totalUnit}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {data.totalUnit > 0 ? Math.round((data.assessedDP3Count / data.totalUnit) * 100) : 0}% Dinilai
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operasional To-Do Lists Khusus Unit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Guru Belum Lengkapi Berkas */}
        <Card className="rounded-2xl border-border shadow-2xs">
          <CardHeader className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Upload className="h-4 w-4 text-amber-500" />
                <span>Guru Belum Lengkapi Berkas ({missingDocs.length})</span>
              </CardTitle>
            </div>
            <Button asChild size="sm" variant="ghost" className="text-xs h-7">
              <Link href="/data-dokumen-penting">Kelola Semua</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {missingDocs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                Seluruh guru unit telah melengkapi 7 dokumen penting.
              </p>
            ) : (
              <div className="space-y-2.5">
                {missingDocs.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-border/60 last:border-0 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{item.fullName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{item.nip}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                      {item.count}/7 Dokumen
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guru Belum Isi Form Kesediaan */}
        <Card className="rounded-2xl border-border shadow-2xs">
          <CardHeader className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Handshake className="h-4 w-4 text-indigo-500" />
                <span>Guru Belum Isi Kesediaan ({missingKesediaan.length})</span>
              </CardTitle>
            </div>
            <Button asChild size="sm" variant="ghost" className="text-xs h-7">
              <Link href="/kesediaan">Pantau Semua</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {missingKesediaan.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                Seluruh guru unit telah mengisi form kesediaan mengajar.
              </p>
            ) : (
              <div className="space-y-2.5">
                {missingKesediaan.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-border/60 last:border-0 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{item.fullName}</p>
                      <p className="text-[11px] text-muted-foreground">{item.position}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-500/30">
                      Belum Mengisi
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Demografi Usia & Gender Unit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl border-border shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Distribusi Usia Staf Unit
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={data.perUsia} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="bracket" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} orang`, "Jumlah"]} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <CardTitle className="text-sm font-semibold">Distribusi Gender Staf Unit</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Laki-laki", value: data.lakiLakiUnit },
                    { name: "Perempuan", value: data.perempuanUnit },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  <Cell fill="#166534" />
                  <Cell fill="#ca8a04" />
                </Pie>
                <Legend iconType="circle" iconSize={10} />
                <Tooltip formatter={(v) => [`${v} orang`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// =============================================================================
// 3. VIEW: PIMPINAN (Supervisi Kinerja, Evaluasi DP3 & Keputusan)
// =============================================================================
function PimpinanDashboardView({ user, data }: { user: UserInfo; data: any }) {
  const unAssessed = data?.unAssessedStaff || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 text-xs font-bold px-2 py-0.5">
              Pimpinan
            </Badge>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Dashboard Supervisi & Evaluasi Kinerja
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pengawasan kinerja staf dan pemantauan formasi untuk: <span className="font-semibold text-foreground">{data.departmentName}</span>.
          </p>
        </div>
      </div>

      {/* 4 KPI Supervisi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Total Staf Binaan
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                {data.totalStaff} Orang
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Staf Aktif Binaan
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Progres Penilaian DP3
              </p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {data.assessedCount} / {data.totalStaff}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {data.totalStaff > 0 ? Math.round((data.assessedCount / data.totalStaff) * 100) : 0}% Selesai Dinilai
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Menunggu Penilaian
              </p>
              <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {data.unAssessedCount} Staf
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Perlu Input Nilai
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Kesiapan Mengajar
              </p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {data.kesediaanReadyCount} Guru
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Siap Mengajar Penuh
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Handshake className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Antrean Staf yang Belum Dinilai DP3 */}
      <Card className="rounded-2xl border-border shadow-2xs">
        <CardHeader className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-purple-600" />
              <span>Antrean Penilaian Kinerja DP3 Staf Binaan</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Staf yang belum dievaluasi pada periode penilaian saat ini.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="rounded-xl text-xs h-8 gap-1.5 shadow-xs">
            <Link href="/dp3">
              <span>Buka Modul DP3</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          {unAssessed.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              Luar biasa! Seluruh staf binaan telah selesai dinilai pada periode ini.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {unAssessed.map((st: any) => (
                <div key={st.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-foreground">{st.fullName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{st.nip}</span>
                      <span>•</span>
                      <span>{st.position}</span>
                      <span>•</span>
                      <span>{st.department}</span>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs text-purple-700 dark:text-purple-300 border-purple-500/20 hover:bg-purple-500/10 self-start sm:self-auto">
                    <Link href="/dp3">Beri Nilai DP3</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// 4. VIEW: SUPER_ADMIN (Sistem, Keamanan & Audit Trail)
// =============================================================================
function SuperAdminDashboardView({ user, data }: { user: UserInfo; data: any }) {
  const recentLogs = data?.recentLogs || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 text-xs font-bold px-2 py-0.5">
              Super Admin
            </Badge>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Dashboard Super Administrator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Status akun pengguna, keamanan sistem, dan log audit aktivitas SIMKA 9.
          </p>
        </div>
      </div>

      {/* 4 KPI Sistem */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link href="/akun">
          <Card className="rounded-2xl border-border bg-card shadow-2xs hover:border-primary/50 transition duration-200 h-full">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Akun User
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                  {data.totalUsers} Akun
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {data.activeUsers} Aktif Login
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <Settings className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pegawai">
          <Card className="rounded-2xl border-border bg-card shadow-2xs hover:border-primary/50 transition duration-200 h-full">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Master Pegawai
                </p>
                <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
                  {data.totalEmployees} Orang
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Seluruh Basis Data
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/log-aktivitas">
          <Card className="rounded-2xl border-border bg-card shadow-2xs hover:border-primary/50 transition duration-200 h-full">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Log Aktivitas Hari Ini
                </p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {data.logsToday} Aksi
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Audit Trail 24 Jam
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Activity className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/master/departemen">
          <Card className="rounded-2xl border-border bg-card shadow-2xs hover:border-primary/50 transition duration-200 h-full">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Master Departemen
                </p>
                <p className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                  {data.masterCounts?.departments ?? 0} Unit
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {data.masterCounts?.positions ?? 0} Jabatan Master
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                <Database className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Audit Log Aktivitas Sistem Terkini */}
      <Card className="rounded-2xl border-border shadow-2xs">
        <CardHeader className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              <span>Log Aktivitas Sistem Terkini (Audit Trail)</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Riwayat login, modifikasi data pegawai, dan perubahan kredensial.
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost" className="text-xs h-8">
            <Link href="/log-aktivitas">Lihat Semua Log</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          {recentLogs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              Belum ada rekaman audit log.
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {recentLogs.map((log: any) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {log.user?.name ?? "Sistem"}
                      <span className="text-muted-foreground font-normal ml-1.5">({log.user?.role ?? "User"})</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {log.action} pada entitas {log.entity}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                    {format(new Date(log.createdAt), "HH:mm:ss d/M/yy")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// 5. VIEW: HR PUSAT / YAYASAN (Cross-Unit SDM Intelligence)
// =============================================================================
function HrPusatDashboardView({ user, data }: { user: UserInfo; data: any }) {
  const kpiCards = [
    { label: "Total Pegawai", value: data.total, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pegawai Aktif", value: data.aktif, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Non-Aktif / Cuti", value: data.nonAktif, icon: UserX, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Baru Bulan Ini", value: data.baruBulanIni, icon: UserPlus, color: "text-accent", bg: "bg-accent/10" },
  ]

  const genderData = [
    { name: "Laki-laki", value: data.lakiLaki },
    { name: "Perempuan", value: data.perempuan },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Dashboard Kepegawaian Yayasan Al Wathoniyah 9
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Statistik dan pemantauan distribusi SDM seluruh unit sekolah & yayasan.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="rounded-2xl border-border bg-card shadow-2xs">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className={`text-xl sm:text-2xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl lg:col-span-2 border-border shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Distribusi Pegawai per Departemen / Lembaga
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={data.perDepartemen} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} orang`, "Jumlah"]} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <CardTitle className="text-sm font-semibold">Distribusi Gender Yayasan</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" outerRadius={70} dataKey="value" labelLine={false} label={renderCustomLabel}>
                  {genderData.map((_, i) => (
                    <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={10} />
                <Tooltip formatter={(v) => [`${v} orang`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Employees */}
      {data.recentEmployees && data.recentEmployees.length > 0 && (
        <Card className="rounded-2xl border-border shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <CardTitle className="text-sm font-semibold">Pegawai Baru Masuk Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="divide-y divide-border/60">
              {data.recentEmployees.map((emp: any) => (
                <div key={emp.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{emp.fullName}</p>
                    <p className="text-[11px] text-muted-foreground">{emp.employeeIdNumber} • {emp.department?.name ?? "-"}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                    Masuk {format(new Date(emp.createdAt), "d MMM yyyy", { locale: id })}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// =============================================================================
// 6. VIEW: PEMILIK YAYASAN (Strategic Oversight & Approval)
// =============================================================================
function PemilikYayasanDashboardView({ user, data }: { user: UserInfo; data: any }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-xs font-bold px-2 py-0.5">
              Pemilik Yayasan
            </Badge>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Dashboard Eksekutif Yayasan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Ringkasan pengawasan strategis dan otorisasi kinerja SDM Al Wathoniyah Asshodriyah 9.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Total SDM Yayasan
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                {data.totalEmployees} Orang
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {data.aktifEmployees} Aktif
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Link href="/dp3">
          <Card className="rounded-2xl border-border bg-card shadow-2xs hover:border-amber-500/50 transition duration-200 h-full">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Pengajuan DP3
                </p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {data.pendingDP3Count} Berkas
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Approval Yayasan
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/laporan/jabatan">
          <Card className="rounded-2xl border-border bg-card shadow-2xs hover:border-emerald-500/50 transition duration-200 h-full">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Laporan Jabatan
                </p>
                <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  Distribusi Guru
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Formasi SDM
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pegawai">
          <Card className="rounded-2xl border-border bg-card shadow-2xs hover:border-purple-500/50 transition duration-200 h-full">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Direktori Staf
                </p>
                <p className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
                  Semua Unit
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tinjauan Eksekutif
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Bar Chart: Sebaran Pegawai per Departemen */}
      <Card className="rounded-2xl border-border shadow-2xs">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Sebaran Tenaga Pendidik & Staf per Lembaga Pendidikan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={data.perDepartemen} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} orang`, "Jumlah"]} />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
