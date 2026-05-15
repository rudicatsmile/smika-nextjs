"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Loader2, Upload, FileText, X, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { upsertImportantDocument, getImportantDocuments } from "@/server/actions/important-document"

const DOCUMENT_TYPES = [
  { key: "KTP", label: "KTP" },
  { key: "KARTU_KELUARGA", label: "Kartu Keluarga" },
  { key: "IJAZAH", label: "Ijazah" },
  { key: "NPWP", label: "NPWP" },
  { key: "BPJS", label: "BPJS" },
  { key: "SERTIFIKASI_PENDIDIKAN", label: "Sertifikasi Pendidikan" },
  { key: "SK_PENGANGKATAN", label: "SK Pengangkatan" },
]

interface ImportantDocumentItem {
  id: string
  employeeId: string
  documentType: string
  fileUrl?: string
}

interface Employee {
  id: string
  fullName: string
  employeeIdNumber: string
  department: { id: string; name: string }
}

export function ImportantDocumentUploadDialog({ 
  open, 
  onOpenChange, 
  employee 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
}) {
  const [documents, setDocuments] = useState<ImportantDocumentItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [uploadingType, setUploadingType] = useState<string | null>(null)

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
    if (result.success) {
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
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
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

      // Remove data URL prefix
      const base64Data = base64.split(',')[1]

      const result = await upsertImportantDocument({
        employeeId: employee.id,
        documentType,
        fileUrl: base64Data,
      })

      if (result.success) {
        toast.success(`Dokumen ${documentType} berhasil diupload`)
        await fetchDocuments()
      } else {
        toast.error(result.error || "Gagal mengupload dokumen")
        if (result.details) {
          console.error("Upload error details:", result.details)
        }
      }
    } catch (error) {
      toast.error("Gagal memproses file")
    } finally {
      setIsPending(false)
      setUploadingType(null)
    }
  }

  const handleDelete = async (documentId: string, documentType: string) => {
    setIsPending(true)
    try {
      const result = await fetch(`/api/important-document/${documentId}`, {
        method: "DELETE",
      })
      
      if (result.ok) {
        toast.success(`Dokumen ${documentType} berhasil dihapus`)
        await fetchDocuments()
      } else {
        toast.error("Gagal menghapus dokumen")
      }
    } catch (error) {
      toast.error("Gagal menghapus dokumen")
    } finally {
      setIsPending(false)
    }
  }

  const getDocumentStatus = (documentType: string) => {
    const doc = documents.find(d => d.documentType === documentType)
    return doc
  }

  const getDocumentLabel = (key: string) => {
    const docType = DOCUMENT_TYPES.find(d => d.key === key)
    return docType?.label || key
  }

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Dokumen Penting</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {employee.fullName} ({employee.employeeIdNumber}) - {employee.department.name}
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {DOCUMENT_TYPES.map((docType) => {
            const doc = getDocumentStatus(docType.key)
            return (
              <div key={docType.key} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      doc?.fileUrl 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" 
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                      {doc?.fileUrl ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium">{docType.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {doc?.fileUrl ? "Sudah diupload" : "Belum diupload"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {doc?.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Create download link
                          const link = document.createElement('a')
                          link.href = `data:application/pdf;base64,${doc.fileUrl}`
                          link.download = `${docType.label}_${employee.employeeIdNumber}.pdf`
                          link.click()
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, docType.key)}
                        disabled={isPending}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        id={`file-${docType.key}`}
                      />
                      <Button 
                        variant={doc?.fileUrl ? "outline" : "default"} 
                        size="sm"
                        disabled={isPending && uploadingType === docType.key}
                      >
                        {isPending && uploadingType === docType.key ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {doc?.fileUrl ? "Ganti" : "Upload"}
                      </Button>
                    </div>

                    {doc?.fileUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id, docType.key)}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
