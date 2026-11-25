"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Download,
  ArrowLeft,
  Search,
  Building2,
  ClipboardCheck,
  Trophy,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts"
import { cn } from "@/lib/utils"

interface DP3AnalitikRecord {
  id: string
  tahunId: string
  tahunName: string
  tahunOrder: number
  statusName: string
  employeeId: string
  employeeName: string
  employeeNip: string
  departmentId: string | null
  departmentName: string
  positionName: string
  jumlah: number
  rataRata: number
  bobot: number
  aspek: {
    kualitasKerja: number
    kedisiplinan: number
    kerjasama: number
    komitmen: number
    pengembanganDiri: number
    teknologi: number
    ketaatan: number
    komunikasi: number
    inisiatif: number
  }
}

interface DP3AnalitikClientProps {
  years: { id: string; name: string }[]
  departments: { id: string; name: string }[]
  records: DP3AnalitikRecord[]
  activeEmployees: { id: string; departmentId: string | null }[]
  isUnitScoped: boolean
  lockedDepartmentId: string | null
  lockedDepartmentName: string | null
}

const COLORS = ["#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#65a30d"]

export function DP3AnalitikClient({
  years,
  departments,
  records,
  activeEmployees,
  isUnitScoped,
  lockedDepartmentId,
  lockedDepartmentName,
}: DP3AnalitikClientProps) {
  const [selectedYear, setSelectedYear] = useState<string>(years[0]?.id ?? "ALL")
  const [selectedDept, setSelectedDept] = useState<string>(
    isUnitScoped && lockedDepartmentId ? lockedDepartmentId : "ALL"
  )
  const [search, setSearch] = useState("")

  // Filter utama untuk KPI, perbandingan unit, aspek, dan peringkat
  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase()
    return records.filter((r) => {
      if (selectedYear !== "ALL" && r.tahunId !== selectedYear) return false
      if (selectedDept !== "ALL" && r.departmentId !== selectedDept) return false
      if (
        q &&
        !r.employeeName.toLowerCase().includes(q) &&
        !r.employeeNip.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [records, selectedYear, selectedDept, search])

  // KPI
  const kpi = useMemo(() => {
    const total = filteredRecords.length
    const avgScore =
      total > 0
        ? Math.round(
            (filteredRecords.reduce((acc, r) => acc + r.rataRata, 0) / total) * 10
          ) / 10
        : 0
    const highest = total > 0 ? Math.max(...filteredRecords.map((r) => r.rataRata)) : 0
    const scopedActive = activeEmployees.filter((e) =>
      selectedDept === "ALL" ? true : e.departmentId === selectedDept
    ).length
    const assessedUnique = new Set(filteredRecords.map((r) => r.employeeId)).size
    const coveragePct =
      scopedActive > 0 ? Math.min(100, Math.round((assessedUnique / scopedActive) * 100)) : 0

    return { total, avgScore, highest, assessedUnique, scopedActive, coveragePct }
  }, [filteredRecords, activeEmployees, selectedDept])

  // Perbandingan rata-rata antar tahun (mengikuti filter unit, tidak dikunci oleh tahun terpilih)
  const trendByYear = useMemo(() => {
    const map = new Map<
      string,
      { name: string; order: number; sum: number; count: number }
    >()
    records.forEach((r) => {
      if (selectedDept !== "ALL" && r.departmentId !== selectedDept) return
      const cur = map.get(r.tahunId) ?? {
        name: r.tahunName,
        order: r.tahunOrder,
        sum: 0,
        count: 0,
      }
      cur.sum += r.rataRata
      cur.count += 1
      map.set(r.tahunId, cur)
    })

    return Array.from(map.values())
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
      .map((item) => ({
        tahun: item.name,
        rataRata: Math.round((item.sum / item.count) * 10) / 10,
        jumlah: item.count,
      }))
  }, [records, selectedDept])

  // Rata-rata per Unit / Departemen
  const perUnitData = useMemo(() => {
    const map = new Map<string, { name: string; sum: number; count: number }>()
    filteredRecords.forEach((r) => {
      const cur = map.get(r.departmentName) ?? {
        name: r.departmentName,
        sum: 0,
        count: 0,
      }
      cur.sum += r.rataRata
      cur.count += 1
      map.set(r.departmentName, cur)
    })
    return Array.from(map.values())
      .map((item) => ({
        name: item.name,
        rataRata: Math.round((item.sum / item.count) * 10) / 10,
        jumlah: item.count,
      }))
      .sort((a, b) => b.rataRata - a.rataRata)
  }, [filteredRecords])

  // Rata-rata 9 Aspek Penilaian
  const aspekData = useMemo(() => {
    const count = filteredRecords.length || 1
    const sum = filteredRecords.reduce(
      (acc, r) => ({
        kualitasKerja: acc.kualitasKerja + r.aspek.kualitasKerja,
        kedisiplinan: acc.kedisiplinan + r.aspek.kedisiplinan,
        kerjasama: acc.kerjasama + r.aspek.kerjasama,
        komitmen: acc.komitmen + r.aspek.komitmen,
        pengembanganDiri: acc.pengembanganDiri + r.aspek.pengembanganDiri,
        teknologi: acc.teknologi + r.aspek.teknologi,
        ketaatan: acc.ketaatan + r.aspek.ketaatan,
        komunikasi: acc.komunikasi + r.aspek.komunikasi,
        inisiatif: acc.inisiatif + r.aspek.inisiatif,
      }),
      {
        kualitasKerja: 0,
        kedisiplinan: 0,
        kerjasama: 0,
        komitmen: 0,
        pengembanganDiri: 0,
        teknologi: 0,
        ketaatan: 0,
        komunikasi: 0,
        inisiatif: 0,
      }
    )

    const items = [
      { label: "Kualitas Kerja", val: sum.kualitasKerja },
      { label: "Kedisiplinan", val: sum.kedisiplinan },
      { label: "Kerjasama Tim", val: sum.kerjasama },
      { label: "Komitmen Visi Misi", val: sum.komitmen },
      { label: "Pengembangan Diri", val: sum.pengembanganDiri },
      { label: "Teknologi", val: sum.teknologi },
      { label: "Ketaatan", val: sum.ketaatan },
      { label: "Komunikasi", val: sum.komunikasi },
      { label: "Inisiatif", val: sum.inisiatif },
    ]

    return items.map((i) => ({
      name: i.label,
      rataRata: filteredRecords.length > 0 ? Math.round((i.val / count) * 10) / 10 : 0,
    }))
  }, [filteredRecords])

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (selectedYear !== "ALL") params.set("tahunId", selectedYear)
    if (selectedDept !== "ALL") params.set("departmentId", selectedDept)
    return `/api/dp3/export?${params.toString()}`
  }, [selectedYear, selectedDept])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-muted-foreground">
              <Link href="/dp3">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali ke DP3
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Dashboard &amp; Tren Penilaian DP3
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ringkasan nilai rata-rata per unit, perbandingan antar tahun, dan peringkat pegawai
            {isUnitScoped && lockedDepartmentName ? ` · Unit ${lockedDepartmentName}` : ""}
          </p>
        </div>

        <Button asChild size="sm">
          <a href={exportUrl}>
            <Download className="h-4 w-4 mr-2" />
            Export Laporan Excel
          </a>
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Tahun Penilaian</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    Tahun {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isUnitScoped ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/40 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{lockedDepartmentName ?? "Unit Terkunci"}</span>
              </div>
            ) : (
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Departemen / Unit</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau NIP pegawai..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-blue-100 dark:bg-blue-900/30">
              <ClipboardCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{kpi.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Penilaian DP3</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-green-100 dark:bg-green-900/30">
              <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{kpi.avgScore}</p>
              <p className="text-xs text-muted-foreground mt-1">Rata-rata Skor DP3</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-amber-100 dark:bg-amber-900/30">
              <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{kpi.highest}</p>
              <p className="text-xs text-muted-foreground mt-1">Nilai Tertinggi</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-purple-100 dark:bg-purple-900/30">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{kpi.coveragePct}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cakupan ({kpi.assessedUnique}/{kpi.scopedActive} aktif)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Tren Rata-rata DP3 Antar Tahun
            </CardTitle>
            <CardDescription>Perkembangan nilai rata-rata dari tahun ke tahun</CardDescription>
          </CardHeader>
          <CardContent>
            {trendByYear.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Belum ada data penilaian.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendByYear} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="tahun" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rataRata"
                    name="Rata-rata Skor"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Rata-rata Nilai per Unit / Departemen
            </CardTitle>
            <CardDescription>Perbandingan performa antar unit</CardDescription>
          </CardHeader>
          <CardContent>
            {perUnitData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Belum ada data penilaian.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={perUnitData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => (v.length > 18 ? v.slice(0, 16) + "…" : v)}
                  />
                  <Tooltip />
                  <Bar dataKey="rataRata" name="Rata-rata" radius={[0, 4, 4, 0]}>
                    {perUnitData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 9 Aspek Penilaian */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rata-rata 9 Aspek Penilaian Kinerja</CardTitle>
          <CardDescription>Pemetaan kekuatan dan area pengembangan SDM</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={aspekData} margin={{ top: 10, right: 16, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="rataRata" name="Rata-rata Aspek" radius={[4, 4, 0, 0]} fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Peringkat Pegawai */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Peringkat Nilai DP3 Pegawai
          </CardTitle>
          <CardDescription>
            Diurutkan berdasarkan nilai rata-rata tertinggi ({filteredRecords.length} data)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] text-center">#</TableHead>
                  <TableHead>Pegawai</TableHead>
                  <TableHead>Unit / Jabatan</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Rata-rata</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      Tidak ada data penilaian DP3 sesuai filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.slice(0, 50).map((r, idx) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-center font-semibold">
                        {idx < 3 ? (
                          <Badge
                            variant="secondary"
                            className={cn(
                              idx === 0 && "bg-amber-100 text-amber-800",
                              idx === 1 && "bg-slate-200 text-slate-800",
                              idx === 2 && "bg-orange-100 text-orange-800"
                            )}
                          >
                            {idx + 1}
                          </Badge>
                        ) : (
                          idx + 1
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{r.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{r.employeeNip}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium">{r.departmentName}</p>
                        <p className="text-xs text-muted-foreground">{r.positionName}</p>
                      </TableCell>
                      <TableCell className="text-xs">{r.tahunName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px]">
                          {r.statusName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{r.jumlah}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "font-bold text-sm",
                            r.rataRata >= 85
                              ? "text-green-600"
                              : r.rataRata >= 70
                              ? "text-blue-600"
                              : "text-amber-600"
                          )}
                        >
                          {r.rataRata}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <Link href={`/pegawai/${r.employeeId}?tab=dp3`} title="Lihat Profil">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
