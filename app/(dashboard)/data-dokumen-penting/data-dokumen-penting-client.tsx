"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  FileText,
  Building2,
  User,
  Loader2,
  Search,
  Upload,
  Check,
  X,
  AlertCircle,
  Eye,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
} from "lucide-react"
import { getEmployeesWithDocumentStatus } from "@/server/actions/important-document"
import {
  ImportantDocumentUploadDialog,
  DOCUMENT_TYPES,
} from "@/components/important-document/important-document-upload-dialog"
import {
  DocumentPreviewDialog,
  PreviewDocumentInfo,
  resolveDocumentSrc,
  downloadDocument,
} from "@/components/important-document/document-preview-dialog"
import { Role } from "@/app/generated/prisma/enums"
import { cn } from "@/lib/utils"

interface Department {
  id: string
  name: string
}

interface EmployeeWithDocuments {
  id: string
  fullName: string
  employeeIdNumber: string
  department: { id: string; name: string } | null
  importantDocuments: Array<{
    id: string
    documentType: string
    fileUrl: string | null
    uploadedAt?: Date | string | null
  }>
}

export function DataDokumenPentingClient({
  departments,
  userRole,
}: {
  departments: Department[]
  userRole?: Role
}) {
  const { data: session } = useSession()
  const role = session?.user?.role as Role | undefined
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [documentStatus, setDocumentStatus] = useState<"all" | "uploaded" | "not_uploaded" | "complete">("all")
  const [employees, setEmployees] = useState<EmployeeWithDocuments[]>([])
  const [isPending, setIsPending] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithDocuments | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  // State untuk Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState<PreviewDocumentInfo | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (userRole === "PIMPINAN" && departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0].id)
    }
  }, [userRole, departments, selectedDepartment])

  const fetchEmployees = async () => {
    setIsPending(true)
    try {
      const result = await getEmployeesWithDocumentStatus({
        departmentId: selectedDepartment || undefined,
        search: searchQuery || undefined,
        documentStatus: documentStatus === "all" ? undefined : documentStatus,
      })
      if (result.success && result.data) {
        setEmployees(result.data)
      }
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchEmployees()
    }
  }, [selectedDepartment, searchQuery, documentStatus, mounted])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchEmployees()
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const handleUploadClick = (employee: EmployeeWithDocuments) => {
    setSelectedEmployee(employee)
    setUploadDialogOpen(true)
  }

  const handlePreviewDirect = (
    employee: EmployeeWithDocuments,
    docTypeKey: string
  ) => {
    const doc = employee.importantDocuments.find((d) => d.documentType === docTypeKey)
    if (!doc?.fileUrl) return

    const docTypeObj = DOCUMENT_TYPES.find((d) => d.key === docTypeKey)
    const docLabel = docTypeObj?.label || docTypeKey

    setPreviewDoc({
      id: doc.id,
      title: `${docLabel} - ${employee.fullName}`,
      documentType: doc.documentType,
      fileUrl: doc.fileUrl,
      employeeName: employee.fullName,
      employeeNip: employee.employeeIdNumber,
      uploadedAt: doc.uploadedAt,
    })
    setPreviewOpen(true)
  }

  const getDocumentStatus = (employee: EmployeeWithDocuments, documentType: string) => {
    return employee.importantDocuments.find((d) => d.documentType === documentType)
  }

  const getCompletionPercentage = (employee: EmployeeWithDocuments) => {
    const uploaded = employee.importantDocuments.filter((d) => d.fileUrl).length
    const total = DOCUMENT_TYPES.length
    return Math.round((uploaded / total) * 100)
  }

  // Statistik Ringkasan Dokumen
  const stats = useMemo(() => {
    const total = employees.length
    let complete = 0
    let partial = 0
    let empty = 0

    employees.forEach((emp) => {
      const count = emp.importantDocuments.filter((d) => d.fileUrl).length
      if (count === DOCUMENT_TYPES.length) complete++
      else if (count > 0) partial++
      else empty++
    })

    return { total, complete, partial, empty }
  }, [employees])

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ======================================================== */}
      {/* 1. HEADER SECTION                                        */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 shadow-2xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Data Dokumen Penting
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {role === "PEGAWAI"
                  ? "Arsip digital dan kelengkapan berkas kepegawaian Anda"
                  : "Monitoring, verifikasi, dan arsip digital seluruh pegawai"}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchEmployees}
          disabled={isPending}
          className="self-start sm:self-auto text-xs h-9 gap-1.5"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isPending && "animate-spin")} />
          <span>Segarkan Data</span>
        </Button>
      </div>

      {/* ======================================================== */}
      {/* 2. STATISTIK RINGKASAN                                   */}
      {/* ======================================================== */}
      {role !== "PEGAWAI" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card Total */}
          <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Total Pegawai</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{stats.total}</p>
            </div>
          </div>

          {/* Card Lengkap */}
          <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Lengkap (100%)</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.complete}
              </p>
            </div>
          </div>

          {/* Card Sebagian */}
          <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Sebagian Diupload</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {stats.partial}
              </p>
            </div>
          </div>

          {/* Card Belum Diupload */}
          <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Belum Ada Berkas</p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                {stats.empty}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. FILTER & PENCARIAN (Responsive & Thumb-Friendly)      */}
      {/* ======================================================== */}
      {role !== "PEGAWAI" && (
        <Card className="rounded-2xl border-border shadow-2xs overflow-hidden">
          <CardContent className="p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Form Input Pencarian */}
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama pegawai atau NIP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9.5 pr-9 h-10 text-sm rounded-xl"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title="Hapus pencarian"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>

              {/* Filter Selects */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
                {/* Filter Departemen */}
                <div className="flex-1 sm:w-56">
                  {userRole === "PIMPINAN" ? (
                    <div className="h-10 px-3 border border-border rounded-xl bg-muted/30 text-xs flex items-center text-foreground font-medium truncate">
                      {departments.length > 0 ? departments[0].name : "Unit Anda"}
                    </div>
                  ) : (
                    <Select
                      value={selectedDepartment || "all"}
                      onValueChange={(v) => setSelectedDepartment(v === "all" ? "" : v)}
                    >
                      <SelectTrigger className="h-10 rounded-xl text-xs">
                        <SelectValue placeholder="Semua Departemen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Departemen</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Filter Status Dokumen */}
                <div className="flex-1 sm:w-48">
                  <Select
                    value={documentStatus}
                    onValueChange={(v: any) => setDocumentStatus(v)}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-xs">
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="complete">Lengkap (100%)</SelectItem>
                      <SelectItem value="uploaded">Sebagian Diupload</SelectItem>
                      <SelectItem value="not_uploaded">Belum Diupload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Filter:
              </span>
              {[
                { key: "all", label: "Semua" },
                { key: "complete", label: "Lengkap (100%)" },
                { key: "uploaded", label: "Sebagian Diupload" },
                { key: "not_uploaded", label: "Belum Ada" },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setDocumentStatus(pill.key as any)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-lg border transition-all flex-shrink-0 font-medium",
                    documentStatus === pill.key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                  )}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* 4. DAFTAR PEGAWAI & DOKUMEN (Modern Cards Layout)        */}
      {/* ======================================================== */}
      <div className="space-y-4">
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-xs">Memuat data dokumen...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-card">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">Tidak ada pegawai ditemukan</p>
            <p className="text-xs text-muted-foreground mt-1">
              Coba sesuaikan kata kunci pencarian atau ubah pilihan filter departemen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {employees.map((employee) => {
              const uploadedCount = employee.importantDocuments.filter((d) => d.fileUrl).length
              const totalCount = DOCUMENT_TYPES.length
              const percentage = Math.round((uploadedCount / totalCount) * 100)
              const initials = employee.fullName
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase()

              return (
                <div
                  key={employee.id}
                  className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all duration-200 shadow-2xs space-y-4"
                >
                  {/* Baris Atas: Info Profil + Progress */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-11 w-11 rounded-xl border border-border shadow-2xs flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm rounded-xl">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                            {employee.fullName}
                          </h3>
                          <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 h-4">
                            {employee.employeeIdNumber}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {employee.department?.name ?? "Tanpa Unit"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress & Tombol Kelola */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      <div className="flex flex-col sm:items-end">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground font-medium">
                            Kelengkapan:
                          </span>
                          <span
                            className={cn(
                              "text-xs font-bold",
                              percentage === 100
                                ? "text-emerald-600 dark:text-emerald-400"
                                : percentage >= 50
                                ? "text-primary"
                                : "text-amber-600 dark:text-amber-400"
                            )}
                          >
                            {uploadedCount}/{totalCount} ({percentage}%)
                          </span>
                        </div>
                        {/* Sleek Progress Bar */}
                        <div className="w-28 sm:w-32 bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              percentage === 100
                                ? "bg-emerald-500"
                                : percentage >= 50
                                ? "bg-primary"
                                : "bg-amber-500"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => handleUploadClick(employee)}
                        size="sm"
                        className="h-9 px-3 text-xs gap-1.5 rounded-xl shadow-xs"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Kelola Dokumen</span>
                      </Button>
                    </div>
                  </div>

                  {/* Baris Tengah: Grid Dokumen dengan 1-Tap Preview */}
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                      Status Dokumen & Pratinjau Cepat:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                      {DOCUMENT_TYPES.map((docType) => {
                        const doc = getDocumentStatus(employee, docType.key)
                        const hasFile = Boolean(doc?.fileUrl)
                        const { formatName } = resolveDocumentSrc(doc?.fileUrl)

                        return (
                          <div
                            key={docType.key}
                            className={cn(
                              "p-2.5 rounded-xl border transition-all duration-200 flex flex-col justify-between group",
                              hasFile
                                ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60 hover:bg-emerald-500/10"
                                : "border-dashed border-border bg-muted/20"
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-bold text-foreground truncate">
                                {docType.label}
                              </span>
                              {hasFile ? (
                                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                              ) : (
                                <X className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                              )}
                            </div>

                            {hasFile && doc?.fileUrl ? (
                              <div className="flex items-center justify-between mt-1 pt-1 border-t border-emerald-500/15">
                                <span className="text-[9px] text-emerald-700 dark:text-emerald-300 font-semibold truncate">
                                  {formatName}
                                </span>
                                <div className="flex items-center gap-1">
                                  {/* Tombol Preview Cepat */}
                                  <button
                                    type="button"
                                    onClick={() => handlePreviewDirect(employee, docType.key)}
                                    title="Lihat Pratinjau"
                                    className="p-1 rounded-md text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                  {/* Tombol Download Cepat */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      downloadDocument(
                                        doc.fileUrl,
                                        `${docType.label}_${employee.employeeIdNumber}`
                                      )
                                    }
                                    title="Download Berkas"
                                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1 pt-1 border-t border-border/40 flex items-center justify-between">
                                <span className="text-[9px] text-muted-foreground truncate">
                                  Belum ada
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUploadClick(employee)}
                                  className="text-[10px] text-primary hover:underline font-medium"
                                >
                                  + Upload
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. MODAL DIALOGS                                         */}
      {/* ======================================================== */}
      {/* Upload & Management Dialog */}
      {selectedEmployee && (
        <ImportantDocumentUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          employee={selectedEmployee}
          onSuccess={fetchEmployees}
        />
      )}

      {/* Document Preview Modal Dialog (Dapat dibuka dari mana saja) */}
      <DocumentPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        documentInfo={previewDoc}
      />
    </div>
  )
}
