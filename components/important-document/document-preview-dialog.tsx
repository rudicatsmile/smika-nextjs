"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Loader2,
  AlertCircle,
  FileQuestion,
} from "lucide-react"

export interface PreviewDocumentInfo {
  id?: string
  title: string
  documentType: string
  fileUrl: string
  employeeName?: string
  employeeNip?: string
  uploadedAt?: Date | string | null
}

export function resolveDocumentSrc(fileUrl?: string | null): {
  src: string
  isPdf: boolean
  isImage: boolean
  formatName: string
} {
  if (!fileUrl) {
    return { src: "", isPdf: false, isImage: false, formatName: "Unknown" }
  }

  const trimmed = fileUrl.trim()

  // 1. Direct URL path or external URL
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const lower = trimmed.toLowerCase()
    const isPdf = lower.endsWith(".pdf")
    const isImage =
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".webp") ||
      lower.endsWith(".gif")

    return {
      src: trimmed,
      isPdf,
      isImage,
      formatName: isPdf ? "PDF" : isImage ? "Gambar" : "File Dokumen",
    }
  }

  // 2. Data URL
  if (trimmed.startsWith("data:")) {
    const isPdf = trimmed.startsWith("data:application/pdf")
    const isImage = trimmed.startsWith("data:image/")
    return {
      src: trimmed,
      isPdf,
      isImage,
      formatName: isPdf ? "PDF" : isImage ? "Gambar" : "Dokumen",
    }
  }

  // 3. Raw Base64 string inspection
  if (trimmed.startsWith("JVBERi0")) {
    return {
      src: `data:application/pdf;base64,${trimmed}`,
      isPdf: true,
      isImage: false,
      formatName: "PDF",
    }
  }

  if (trimmed.startsWith("/9j/")) {
    return {
      src: `data:image/jpeg;base64,${trimmed}`,
      isPdf: false,
      isImage: true,
      formatName: "Gambar (JPG)",
    }
  }

  if (trimmed.startsWith("iVBORw0KGgo")) {
    return {
      src: `data:image/png;base64,${trimmed}`,
      isPdf: false,
      isImage: true,
      formatName: "Gambar (PNG)",
    }
  }

  // Default fallback: Try PDF data URL
  return {
    src: `data:application/pdf;base64,${trimmed}`,
    isPdf: true,
    isImage: false,
    formatName: "PDF",
  }
}

export function downloadDocument(fileUrl?: string | null, fileName = "dokumen") {
  if (!fileUrl) return
  const { src, isPdf, isImage } = resolveDocumentSrc(fileUrl)
  if (!src) return

  // Format filename extension
  let safeFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, "_")
  if (isPdf && !safeFileName.toLowerCase().endsWith(".pdf")) {
    safeFileName += ".pdf"
  } else if (isImage && !safeFileName.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/)) {
    safeFileName += ".jpg"
  }

  // Normal URL
  if (src.startsWith("/") || src.startsWith("http")) {
    const link = document.createElement("a")
    link.href = src
    link.download = safeFileName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return
  }

  // Data URL
  const link = document.createElement("a")
  link.href = src
  link.download = safeFileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function openDocumentInNewTab(fileUrl?: string | null, title = "Dokumen") {
  if (!fileUrl) return
  const { src, isPdf } = resolveDocumentSrc(fileUrl)
  if (!src) return

  if (src.startsWith("/") || src.startsWith("http")) {
    window.open(src, "_blank")
    return
  }

  // Convert base64 data URL to Blob URL for clean browser viewing
  try {
    const parts = src.split(",")
    const byteString = atob(parts[1] || parts[0])
    const mimeMatch = parts[0].match(/:(.*?);/)
    const mimeType = mimeMatch ? mimeMatch[1] : isPdf ? "application/pdf" : "image/jpeg"

    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }

    const blob = new Blob([ab], { type: mimeType })
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, "_blank")
  } catch {
    window.open(src, "_blank")
  }
}

interface DocumentPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentInfo: PreviewDocumentInfo | null
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  documentInfo,
}: DocumentPreviewDialogProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Reset zoom & rotation saat dokumen baru dibuka
  useEffect(() => {
    if (open) {
      setZoom(1)
      setRotation(0)
      setIsLoading(true)
      setHasError(false)
    }
  }, [open, documentInfo?.fileUrl])

  if (!documentInfo || !documentInfo.fileUrl) return null

  const { src, isPdf, isImage, formatName } = resolveDocumentSrc(documentInfo.fileUrl)
  const downloadName = `${documentInfo.title}_${documentInfo.employeeNip || "dokumen"}`

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[96vw] max-w-4xl h-[92vh] max-h-[92vh] p-0 flex flex-col bg-card border-border shadow-2xl rounded-2xl overflow-hidden focus:outline-none"
      >
        {/* Header Preview */}
        <DialogHeader className="px-4 py-3 border-b border-border bg-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                {isPdf ? (
                  <FileText className="h-4 w-4" />
                ) : isImage ? (
                  <ImageIcon className="h-4 w-4" />
                ) : (
                  <FileQuestion className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-sm font-bold text-foreground truncate flex items-center gap-2">
                  <span>{documentInfo.title}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-semibold">
                    {formatName}
                  </Badge>
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground truncate">
                  {documentInfo.employeeName}
                  {documentInfo.employeeNip ? ` • ${documentInfo.employeeNip}` : ""}
                </p>
              </div>
            </div>

            {/* Quick Actions & Close */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDocumentInNewTab(documentInfo.fileUrl, documentInfo.title)}
                title="Buka di Tab Baru"
                className="h-8 px-2.5 text-xs hidden sm:flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Tab Baru</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadDocument(documentInfo.fileUrl, downloadName)}
                title="Download Dokumen"
                className="h-8 px-2.5 text-xs flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
                className="rounded-full text-muted-foreground hover:text-foreground h-8 w-8 ml-1"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sub Toolbar untuk Kontrol Zoom & Rotasi (Khusus Gambar) */}
          {isImage && (
            <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  title="Perkecil"
                  className="h-7 w-7"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[11px] font-mono text-muted-foreground w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  title="Perbesar"
                  className="h-7 w-7"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleRotate}
                  title="Putar 90 Derajat"
                  className="h-7 w-7 ml-1"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </Button>
                {(zoom !== 1 || rotation !== 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-7 px-2 text-[10px] text-muted-foreground ml-1"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                Posisikan mouse atau geser untuk melihat detail
              </span>
            </div>
          )}
        </DialogHeader>

        {/* Konten Area Dokumen */}
        <div className="flex-1 overflow-auto bg-zinc-950/90 dark:bg-zinc-950 flex items-center justify-center relative p-2 sm:p-4 min-h-[300px]">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950/70 z-10 text-white">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-zinc-300">Memuat tampilan dokumen...</p>
            </div>
          )}

          {/* Error State */}
          {hasError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-white max-w-md">
              <AlertCircle className="h-10 w-10 text-destructive mb-3" />
              <p className="font-semibold text-sm">Dokumen tidak dapat ditampilkan di pratinjau</p>
              <p className="text-xs text-zinc-400 mt-1 mb-4">
                Format berkas mungkin memerlukan aplikasi pembuka eksternal atau koneksi langsung.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => openDocumentInNewTab(documentInfo.fileUrl, documentInfo.title)}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Buka di Tab Baru
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-white hover:bg-zinc-800"
                  onClick={() => downloadDocument(documentInfo.fileUrl, downloadName)}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </Button>
              </div>
            </div>
          ) : isPdf ? (
            /* PDF VIEWER */
            <div className="w-full h-full flex flex-col items-center">
              <iframe
                src={`${src}#toolbar=1&navpanes=0`}
                className="w-full h-full rounded-lg border-0 bg-white shadow-lg"
                title={documentInfo.title}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
              />
              <div className="w-full py-1.5 px-3 bg-zinc-900/90 border-t border-zinc-800 text-center text-[11px] text-zinc-400 sm:hidden">
                Jika PDF tidak muncul di browser HP, silakan klik{" "}
                <button
                  type="button"
                  onClick={() => openDocumentInNewTab(documentInfo.fileUrl, documentInfo.title)}
                  className="text-primary underline font-medium"
                >
                  Buka di Tab Baru
                </button>
              </div>
            </div>
          ) : isImage ? (
            /* IMAGE VIEWER (Dengan Zoom & Rotasi) */
            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
              <img
                src={src}
                alt={documentInfo.title}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: "transform 0.2s ease-out",
                  maxWidth: zoom === 1 ? "100%" : "none",
                  maxHeight: zoom === 1 ? "100%" : "none",
                }}
                className="object-contain rounded-lg shadow-xl"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
              />
            </div>
          ) : (
            /* Fallback generic document */
            <div className="flex flex-col items-center justify-center p-6 text-center text-white">
              <FileText className="h-12 w-12 text-primary mb-3" />
              <p className="font-semibold text-sm">Dokumen Terarsip</p>
              <p className="text-xs text-zinc-400 mt-1 mb-4">
                Dokumen tersedia untuk diunduh atau dibuka secara terpisah.
              </p>
              <Button
                size="sm"
                onClick={() => downloadDocument(documentInfo.fileUrl, downloadName)}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download Dokumen
              </Button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2 border-t border-border bg-card flex items-center justify-between text-xs text-muted-foreground flex-shrink-0">
          <span className="truncate">
            {documentInfo.uploadedAt ? (
              <>Diunggah: {new Date(documentInfo.uploadedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</>
            ) : (
              <>Status: Dokumen Valid</>
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-7 text-xs"
          >
            Tutup Pratinjau
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
