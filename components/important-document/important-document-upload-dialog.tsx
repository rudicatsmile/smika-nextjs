"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Loader2,
  Upload,
  FileText,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  Download,
  Building2,
  User,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"
import {
  upsertImportantDocument,
  getImportantDocuments,
  deleteImportantDocument,
} from "@/server/actions/important-document"
import {
  DocumentPreviewDialog,
  PreviewDocumentInfo,
  downloadDocument,
  resolveDocumentSrc,
} from "./document-preview-dialog"
import { cn } from "@/lib/utils"

export const DOCUMENT_TYPES = [
  { key: "KTP", label: "KTP", desc: "Kartu Tanda Penduduk" },
  { key: "KARTU_KELUARGA", label: "Kartu Keluarga", desc: "Kartu Keluarga terbaru" },
  { key: "IJAZAH", label: "Ijazah", desc: "Ijazah pendidikan terakhir" },
  { key: "NPWP", label: "NPWP", desc: "Nomor Pokok Wajib Pajak" },
  { key: "BPJS", label: "BPJS", desc: "Kartu BPJS Kesehatan / Ketenagakerjaan" },
  { key: "SERTIFIKASI_PENDIDIKAN", label: "Sertifikasi Pendidikan", desc: "Sertifikat Pendidik (jika ada)" },
  { key: "SK_PENGANGKATAN", label: "SK Pengangkatan", desc: "SK Pengangkatan Yayasan" },
]

interface ImportantDocumentItem {
  id: string
  employeeId: string
  documentType: string
  fileUrl?: string | null
  uploadedAt?: Date | string | null
}

interface Employee {
  id: string
  fullName: string
  employeeIdNumber: string
  department?: { id: string; name: string } | null
}

export function ImportantDocumentUploadDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
  onSuccess?: () => void
}) {
  const [documents, setDocuments] = useState<ImportantDocumentItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<PreviewDocumentInfo | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open && mounted) {
      fetchDocuments()
    }
  }, [open, mounted])

  const fetchDocuments = async () => {
    const result = await getImportantDocuments(employee.id)
    if (result.success && result.data) {
      setDocuments(result.data)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB")
      return
    }

    // Check file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Hanya file PDF, JPG, atau PNG yang diperbolehkan")
      return
    }

    setUploadingType(documentType)
    setIsPending(true)

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
      })

      // Send base64 data to server action
      const result = await upsertImportantDocument({
        employeeId: employee.id,
        documentType,
        fileUrl: base64,
      })

      if (result.success) {
        toast.success(`Dokumen ${getDocumentLabel(documentType)} berhasil diupload`)
        await fetchDocuments()
        if (onSuccess) onSuccess()
      } else {
        toast.error(result.error || "Gagal mengupload dokumen")
      }
    } catch {
      toast.error("Gagal memproses file dokumen")
    } finally {
      setIsPending(false)
      setUploadingType(null)
      // Reset input value agar dapat memilih file yang sama kembali
      e.target.value = ""
    }
  }

  const handleDelete = async (documentId: string, documentType: string) => {
    const label = getDocumentLabel(documentType)
    if (!confirm(`Apakah Anda yakin ingin menghapus dokumen ${label}?`)) {
      return
    }

    setDeletingId(documentId)
    setIsPending(true)
    try {
      const result = await deleteImportantDocument(documentId)
      if (result.success) {
        toast.success(`Dokumen ${label} berhasil dihapus`)
        await fetchDocuments()
        if (onSuccess) onSuccess()
      } else {
        toast.error(result.error || "Gagal menghapus dokumen")
      }
    } catch {
      toast.error("Gagal menghapus dokumen")
    } finally {
      setIsPending(false)
      setDeletingId(null)
    }
  }

  const handlePreview = (doc: ImportantDocumentItem) => {
    if (!doc.fileUrl) return
    const docLabel = getDocumentLabel(doc.documentType)
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

  const getDocumentStatus = (documentType: string) => {
    return documents.find((d) => d.documentType === documentType)
  }

  const getDocumentLabel = (key: string) => {
    const docType = DOCUMENT_TYPES.find((d) => d.key === key)
    return docType?.label || key
  }

  const uploadedCount = documents.filter((d) => d.fileUrl).length
  const totalCount = DOCUMENT_TYPES.length
  const percentage = Math.round((uploadedCount / totalCount) * 100)

  if (!mounted) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[88vh] p-0 flex flex-col bg-card border-border shadow-2xl rounded-2xl overflow-hidden focus:outline-none">
          {/* Header Dialog */}
          <DialogHeader className="px-5 py-4 border-b border-border bg-muted/20 flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span>Kelola Dokumen Penting</span>
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {employee.fullName}
                  </span>
                  <span>•</span>
                  <span className="font-mono">{employee.employeeIdNumber}</span>
                  {employee.department && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {employee.department.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Kelengkapan Badge */}
              <Badge
                variant={percentage === 100 ? "default" : "secondary"}
                className={cn(
                  "text-xs px-2.5 py-0.5 font-bold h-6",
                  percentage === 100
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-primary/10 text-primary border-primary/20"
                )}
              >
                {uploadedCount}/{totalCount} ({percentage}%)
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  percentage === 100 ? "bg-emerald-500" : "bg-primary"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </DialogHeader>

          {/* List Dokumen Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 no-scrollbar">
            {DOCUMENT_TYPES.map((docType) => {
              const doc = getDocumentStatus(docType.key)
              const hasFile = Boolean(doc?.fileUrl)
              const isUploading = uploadingType === docType.key
              const isDeleting = deletingId === doc?.id
              const { formatName } = resolveDocumentSrc(doc?.fileUrl)

              return (
                <div
                  key={docType.key}
                  className={cn(
                    "p-3.5 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                    hasFile
                      ? "border-border/80 bg-card hover:bg-muted/30"
                      : "border-dashed border-border bg-muted/10 hover:bg-muted/20"
                  )}
                >
                  {/* Left: Info Dokumen */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                        hasFile
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {hasFile ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-foreground">
                          {docType.label}
                        </span>
                        {hasFile && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatName}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {hasFile ? "Dokumen tersimpan dan valid" : docType.desc}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0 flex-wrap">
                    {hasFile && doc && (
                      <>
                        {/* Tombol Preview / Lihat */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(doc)}
                          className="h-8 px-2.5 text-xs text-primary border-primary/20 hover:bg-primary/10"
                          title="Lihat Pratinjau Dokumen"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span>Lihat</span>
                        </Button>

                        {/* Tombol Download */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            downloadDocument(
                              doc.fileUrl,
                              `${docType.label}_${employee.employeeIdNumber}`
                            )
                          }
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                          title="Download Dokumen"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}

                    {/* Tombol Upload / Ganti */}
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => handleFileChange(e, docType.key)}
                        disabled={isPending}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        id={`file-${docType.key}`}
                      />
                      <Button
                        variant={hasFile ? "ghost" : "default"}
                        size="sm"
                        disabled={isUploading || isPending}
                        className={cn(
                          "h-8 px-3 text-xs",
                          hasFile ? "hover:bg-muted text-foreground" : "shadow-xs"
                        )}
                      >
                        {isUploading ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        <span>{hasFile ? "Ganti" : "Upload"}</span>
                      </Button>
                    </div>

                    {/* Tombol Hapus */}
                    {hasFile && doc && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(doc.id, docType.key)}
                        disabled={isDeleting || isPending}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Hapus Dokumen"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer Dialog */}
          <DialogFooter className="px-5 py-3 border-t border-border bg-muted/10 flex-shrink-0 flex sm:justify-between items-center">
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Format didukung: PDF, JPG, PNG (Maksimal 5MB)
            </span>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Selesai & Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog Modal */}
      <DocumentPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        documentInfo={previewDoc}
      />
    </>
  )
}
