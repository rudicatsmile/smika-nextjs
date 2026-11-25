"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  FileCheck2,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Users,
  AlertTriangle,
  Percent,
  ExternalLink,
  Building2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  COMPLETENESS_ITEMS,
  EmployeeCompletenessRow,
  filterCompletenessRows,
} from "@/lib/document-completeness"
import { cn } from "@/lib/utils"

interface DepartmentOption {
  id: string
  name: string
}

interface RekapBerkasClientProps {
  rows: EmployeeCompletenessRow[]
  departments: DepartmentOption[]
  isUnitScoped: boolean
  lockedDepartmentId: string | null
  lockedDepartmentName: string | null
}

const STATUS_BADGE: Record<string, string> = {
  AKTIF: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  NON_AKTIF: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  CUTI: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PENSIUN: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
}

export function RekapBerkasClient({
  rows,
  departments,
  isUnitScoped,
  lockedDepartmentId,
  lockedDepartmentName,
}: RekapBerkasClientProps) {
  const [departmentId, setDepartmentId] = useState<string>(
    isUnitScoped && lockedDepartmentId ? lockedDepartmentId : "ALL"
  )
  const [employmentStatus, setEmploymentStatus] = useState<string>("AKTIF")
  const [completeness, setCompleteness] = useState<string>("ALL")
  const [q, setQ] = useState<string>("")

  const filteredRows = useMemo(
    () =>
      filterCompletenessRows(rows, {
        departmentId,
        employmentStatus,
        completeness,
        q,
      }),
    [rows, departmentId, employmentStatus, completeness, q]
  )

  const summary = useMemo(() => {
    const total = filteredRows.length
    const complete = filteredRows.filter((r) => r.statusCategory === "LENGKAP").length
    const incomplete = total - complete
    const avgPct =
      total > 0
        ? Math.round(
            filteredRows.reduce((acc, r) => acc + r.percentage, 0) / total
          )
        : 0
    return { total, complete, incomplete, avgPct }
  }, [filteredRows])

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (departmentId !== "ALL") params.set("departmentId", departmentId)
    if (employmentStatus !== "ALL") params.set("employmentStatus", employmentStatus)
    if (completeness !== "ALL") params.set("completeness", completeness)
    if (q.trim()) params.set("q", q.trim())
    return `/api/rekap-berkas/export?${params.toString()}`
  }, [departmentId, employmentStatus, completeness, q])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-primary" />
            Rekap Kelengkapan Berkas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitoring checklist kelengkapan identitas & dokumen penting pegawai
            {isUnitScoped && lockedDepartmentName ? ` · Unit ${lockedDepartmentName}` : ""}
          </p>
        </div>
        <Button asChild size="sm">
          <a href={exportUrl}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel (.xlsx)
          </a>
        </Button>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{summary.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Pegawai Ditampilkan</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{summary.complete}</p>
              <p className="text-xs text-muted-foreground mt-1">Lengkap (8/8)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{summary.incomplete}</p>
              <p className="text-xs text-muted-foreground mt-1">Belum Lengkap</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-primary/10">
              <Percent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{summary.avgPct}%</p>
              <p className="text-xs text-muted-foreground mt-1">Rata-rata Kelengkapan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau NIP..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>

            {isUnitScoped ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/40 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{lockedDepartmentName ?? "Unit Terkunci"}</span>
              </div>
            ) : (
              <Select value={departmentId} onValueChange={setDepartmentId}>
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

            <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status Pegawai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status Pegawai</SelectItem>
                <SelectItem value="AKTIF">Aktif</SelectItem>
                <SelectItem value="NON_AKTIF">Non Aktif</SelectItem>
                <SelectItem value="CUTI">Cuti</SelectItem>
                <SelectItem value="PENSIUN">Pensiun</SelectItem>
              </SelectContent>
            </Select>

            <Select value={completeness} onValueChange={setCompleteness}>
              <SelectTrigger>
                <SelectValue placeholder="Kelengkapan Berkas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kelengkapan</SelectItem>
                <SelectItem value="LENGKAP">Lengkap (100%)</SelectItem>
                <SelectItem value="BELUM_LENGKAP">Belum Lengkap (&lt; 100%)</SelectItem>
                <SelectItem value="SEBAGIAN">Sebagian (1–99%)</SelectItem>
                <SelectItem value="KOSONG">Kosong (0%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Matriks Kelengkapan Berkas Pegawai</CardTitle>
          <CardDescription>
            Menampilkan {filteredRows.length} pegawai. Klik nama pegawai untuk melengkapi dokumen.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[240px]">Pegawai</TableHead>
                  <TableHead>Unit / Jabatan</TableHead>
                  {COMPLETENESS_ITEMS.map((item) => (
                    <TableHead key={item.key} className="text-center px-2">
                      {item.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-[140px]">Skor</TableHead>
                  <TableHead className="w-[60px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={COMPLETENESS_ITEMS.length + 4}
                      className="text-center py-12 text-muted-foreground"
                    >
                      Tidak ada data pegawai sesuai filter yang dipilih.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Link
                          href={`/pegawai/${row.id}?tab=dokumen-penting`}
                          className="font-medium text-sm hover:underline block"
                        >
                          {row.fullName}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {row.employeeIdNumber}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-medium px-1.5 py-0.2 rounded",
                              STATUS_BADGE[row.employmentStatus] ?? "bg-muted"
                            )}
                          >
                            {row.employmentStatus}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium">{row.departmentName}</p>
                        <p className="text-xs text-muted-foreground">{row.positionName}</p>
                      </TableCell>
                      {COMPLETENESS_ITEMS.map((item) => (
                        <TableCell key={item.key} className="text-center px-2">
                          {row.checks[item.key] ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400/70 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">
                              {row.filledCount}/{row.totalCount}
                            </span>
                            <span
                              className={cn(
                                "font-semibold",
                                row.percentage === 100
                                  ? "text-green-600"
                                  : row.percentage >= 50
                                  ? "text-amber-600"
                                  : "text-red-600"
                              )}
                            >
                              {row.percentage}%
                            </span>
                          </div>
                          <Progress
                            value={row.percentage}
                            className={cn(
                              "h-1.5",
                              row.percentage === 100
                                ? "[&>*]:bg-green-500"
                                : row.percentage >= 50
                                ? "[&>*]:bg-amber-500"
                                : "[&>*]:bg-red-500"
                            )}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link
                            href={`/pegawai/${row.id}?tab=dokumen-penting`}
                            title="Buka Dokumen Pegawai"
                          >
                            <ExternalLink className="h-4 w-4" />
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

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {filteredRows.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Tidak ada data pegawai sesuai filter yang dipilih.
            </CardContent>
          </Card>
        ) : (
          filteredRows.map((row) => (
            <Card key={row.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/pegawai/${row.id}?tab=dokumen-penting`}
                      className="font-semibold text-sm hover:underline block truncate"
                    >
                      {row.fullName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {row.employeeIdNumber} · {row.departmentName}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "flex-shrink-0",
                      row.percentage === 100
                        ? "bg-green-100 text-green-700"
                        : row.percentage >= 50
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {row.filledCount}/{row.totalCount} ({row.percentage}%)
                  </Badge>
                </div>

                <Progress
                  value={row.percentage}
                  className={cn(
                    "h-1.5",
                    row.percentage === 100
                      ? "[&>*]:bg-green-500"
                      : row.percentage >= 50
                      ? "[&>*]:bg-amber-500"
                      : "[&>*]:bg-red-500"
                  )}
                />

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {COMPLETENESS_ITEMS.map((item) => (
                    <div
                      key={item.key}
                      className={cn(
                        "flex items-center justify-center gap-1 rounded px-1.5 py-1 text-[11px] border",
                        row.checks[item.key]
                          ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400"
                          : "bg-red-50/50 border-red-200/70 text-red-600 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
                      )}
                    >
                      {row.checks[item.key] ? (
                        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
