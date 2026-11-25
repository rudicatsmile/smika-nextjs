"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  TrendingUp,
  BarChart3,
  FileText,
  PieChart as PieIcon,
  Calendar,
  Building2,
  Briefcase,
  Award,
  ArrowRight,
  ChevronRight,
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from "recharts"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface AnalitikData {
  summary: {
    totalEmployees: number
    aktifEmployees: number
    nonAktifEmployees: number
    cutiEmployees: number
    pensiunEmployees: number
    lakiLaki: number
    perempuan: number
    baruBulanIni: number
    baruTahunIni: number
    avgKelengkapan: number
  }
  perDeptData: { name: string; count: number }[]
  perJabatanData: { name: string; count: number }[]
  perUsia: { bracket: string; count: number }[]
  perMasaKerja: { bracket: string; count: number }[]
  trend: { bulan: string; total: number }[]
  kelengkapanData: {
    id: string
    fullName: string
    nip: string
    department: string
    filled: number
    total: number
    pct: number
  }[]
  perDocType: { name: string; uploaded: number; total: number; pct: number }[]
  recentEmployees: {
    id: string
    fullName: string
    employeeIdNumber: string
    department: string
    position: string
    createdAt: string
  }[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Colors
// ─────────────────────────────────────────────────────────────────────────────
const COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d"]
const GENDER_COLORS = ["#2563eb", "#db2777"]
const STATUS_COLORS = ["#16a34a", "#dc2626", "#d97706", "#6b7280"]

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
  iconBg = "bg-primary/10",
}: {
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  color?: string
  iconBg?: string
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("rounded-xl p-3 flex-shrink-0", iconBg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{label}</p>
          {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function AnalitikClient({ data }: { data: AnalitikData }) {
  const { summary, perDeptData, perJabatanData, perUsia, perMasaKerja, trend, kelengkapanData, perDocType, recentEmployees } = data

  const genderData = [
    { name: "Laki-laki", value: summary.lakiLaki },
    { name: "Perempuan", value: summary.perempuan },
  ]

  const statusData = [
    { name: "Aktif", value: summary.aktifEmployees },
    { name: "Non Aktif", value: summary.nonAktifEmployees },
    { name: "Cuti", value: summary.cutiEmployees },
    { name: "Pensiun", value: summary.pensiunEmployees },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Dashboard Analitik HR
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Statistik dan distribusi data kepegawaian secara komprehensif
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/pegawai">
            <Users className="h-4 w-4 mr-2" />
            Lihat Data Pegawai
          </Link>
        </Button>
      </div>

      {/* ── Kartu Ringkasan ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Pegawai" value={summary.totalEmployees} iconBg="bg-blue-100 dark:bg-blue-900/30" color="text-blue-600 dark:text-blue-400" />
        <StatCard icon={UserCheck} label="Pegawai Aktif" value={summary.aktifEmployees} iconBg="bg-green-100 dark:bg-green-900/30" color="text-green-600 dark:text-green-400" sub={`${Math.round((summary.aktifEmployees / (summary.totalEmployees || 1)) * 100)}% dari total`} />
        <StatCard icon={UserX} label="Tidak Aktif" value={summary.nonAktifEmployees + summary.cutiEmployees + summary.pensiunEmployees} iconBg="bg-red-100 dark:bg-red-900/30" color="text-red-600 dark:text-red-400" />
        <StatCard icon={UserPlus} label="Baru Bulan Ini" value={summary.baruBulanIni} iconBg="bg-purple-100 dark:bg-purple-900/30" color="text-purple-600 dark:text-purple-400" sub={`${summary.baruTahunIni} tahun ini`} />
        <StatCard icon={FileText} label="Rata Kelengkapan" value={`${summary.avgKelengkapan}%`} iconBg="bg-amber-100 dark:bg-amber-900/30" color="text-amber-600 dark:text-amber-400" sub="Dokumen penting" />
      </div>

      {/* ── Tabs Utama ── */}
      <Tabs defaultValue="distribusi">
        <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
          <TabsTrigger value="distribusi">Distribusi</TabsTrigger>
          <TabsTrigger value="demografi">Demografi</TabsTrigger>
          <TabsTrigger value="kelengkapan">Kelengkapan Berkas</TabsTrigger>
          <TabsTrigger value="trend">Tren Pertumbuhan</TabsTrigger>
        </TabsList>

        {/* ── Tab: Distribusi ── */}
        <TabsContent value="distribusi" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Per Departemen */}
            <Card>
              <CardHeader className="pb-2">
                <SectionHeader icon={Building2} title="Distribusi per Departemen / Unit" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={perDeptData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={130}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v.length > 18 ? v.slice(0, 16) + "…" : v}
                    />
                    <Tooltip />
                    <Bar dataKey="count" name="Jumlah" radius={[0, 4, 4, 0]}>
                      {perDeptData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Per Jabatan */}
            <Card>
              <CardHeader className="pb-2">
                <SectionHeader icon={Briefcase} title="10 Jabatan Terbanyak" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={perJabatanData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={130}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v.length > 18 ? v.slice(0, 16) + "…" : v}
                    />
                    <Tooltip />
                    <Bar dataKey="count" name="Jumlah" radius={[0, 4, 4, 0]}>
                      {perJabatanData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Gender & Status */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <SectionHeader icon={Users} title="Distribusi Gender" />
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {genderData.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {genderData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: GENDER_COLORS[i] }} />
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.value} orang</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <SectionHeader icon={Award} title="Status Kepegawaian" />
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {statusData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[i] }} />
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.value} orang</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: Demografi ── */}
        <TabsContent value="demografi" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <SectionHeader icon={Users} title="Distribusi Usia" description="Berdasarkan tanggal lahir pegawai" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={perUsia}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="bracket" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Jumlah" radius={[4, 4, 0, 0]}>
                      {perUsia.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <SectionHeader icon={Calendar} title="Distribusi Masa Kerja" description="Berdasarkan tanggal bergabung" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={perMasaKerja}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="bracket" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Jumlah" radius={[4, 4, 0, 0]}>
                      {perMasaKerja.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Pegawai terbaru */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader icon={UserPlus} title="Pegawai Terbaru Bulan Ini" description={`${recentEmployees.length} pegawai baru bergabung`} />
            </CardHeader>
            <CardContent>
              {recentEmployees.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Tidak ada pegawai baru bulan ini</p>
              ) : (
                <div className="divide-y">
                  {recentEmployees.map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between py-3 gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{emp.fullName}</p>
                        <p className="text-xs text-muted-foreground">{emp.employeeIdNumber} · {emp.department}</p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">{emp.position}</Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" asChild>
                        <Link href={`/pegawai/${emp.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Kelengkapan Berkas ── */}
        <TabsContent value="kelengkapan" className="mt-6 space-y-6">
          {/* Per tipe dokumen */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader icon={FileText} title="Tingkat Unggah per Jenis Dokumen" description="Dari seluruh pegawai aktif" />
            </CardHeader>
            <CardContent className="space-y-3">
              {perDocType.map((doc) => (
                <div key={doc.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{doc.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {doc.uploaded}/{doc.total} · <span className={cn("font-semibold", doc.pct >= 80 ? "text-green-600" : doc.pct >= 50 ? "text-amber-600" : "text-red-600")}>{doc.pct}%</span>
                    </span>
                  </div>
                  <Progress value={doc.pct} className={cn("h-2", doc.pct >= 80 ? "[&>*]:bg-green-500" : doc.pct >= 50 ? "[&>*]:bg-amber-500" : "[&>*]:bg-red-500")} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Daftar pegawai dengan kelengkapan terendah */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader icon={Info} title="Pegawai Aktif — Kelengkapan Berkas Terendah" description="Urut dari yang paling perlu dilengkapi" />
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {kelengkapanData.map((emp) => (
                  <div key={emp.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{emp.fullName}</p>
                        <span className={cn(
                          "text-xs font-semibold px-1.5 py-0.5 rounded",
                          emp.pct >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : emp.pct >= 50 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {emp.pct}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{emp.nip} · {emp.department}</p>
                      <Progress value={emp.pct} className={cn("h-1 mt-1.5", emp.pct >= 80 ? "[&>*]:bg-green-500" : emp.pct >= 50 ? "[&>*]:bg-amber-500" : "[&>*]:bg-red-500")} />
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" asChild>
                      <Link href={`/pegawai/${emp.id}?tab=dokumen-penting`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Tren Pertumbuhan ── */}
        <TabsContent value="trend" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader icon={TrendingUp} title="Tren Total Pegawai — 6 Bulan Terakhir" description="Akumulasi jumlah pegawai terdaftar" />
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total Pegawai"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#2563eb" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary cards trend */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{summary.baruBulanIni}</p>
                <p className="text-sm text-muted-foreground mt-1">Pegawai Baru Bulan Ini</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{summary.baruTahunIni}</p>
                <p className="text-sm text-muted-foreground mt-1">Pegawai Baru Tahun Ini</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{summary.totalEmployees}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Pegawai Terdaftar</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
