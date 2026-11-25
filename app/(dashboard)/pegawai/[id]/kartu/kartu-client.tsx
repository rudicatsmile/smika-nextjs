"use client"

import Link from "next/link"
import { ArrowLeft, Printer, Download, ExternalLink, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

interface KartuClientProps {
  employee: {
    id: string
    fullName: string
    employeeIdNumber: string
    profilePhoto: string | null
    employmentStatus: string
    joinDate: string | null
    department: { name: string } | null
    position: { name: string } | null
  }
  appConfig: {
    appName: string
    appOwner: string | null
    logoUrl: string | null
    address: string | null
    phone: string | null
    website: string | null
    primaryColor: string
  } | null
  qrDataUrl: string
  verifyPath: string
  verifyUrl: string
}

export function KartuClient({
  employee,
  appConfig,
  qrDataUrl,
  verifyPath,
  verifyUrl,
}: KartuClientProps) {
  const orgTitle = appConfig?.appOwner || appConfig?.appName || "SIMKA9"
  const accent = appConfig?.primaryColor || "#0f172a"

  const initials = employee.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleDownloadQr = () => {
    const link = document.createElement("a")
    link.href = qrDataUrl
    link.download = `qr-${employee.employeeIdNumber}.png`
    link.click()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 print:max-w-none print:pb-0">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/pegawai/${employee.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Profil
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={verifyPath} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Pratinjau Verifikasi
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadQr}>
            <Download className="h-4 w-4 mr-2" />
            Unduh QR (.png)
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Cetak / PDF Kartu
          </Button>
        </div>
      </div>

      {/* Header info */}
      <div className="print:hidden">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          Kartu Pegawai Digital &amp; QR Verifikasi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pindai QR Code pada sisi belakang kartu untuk memverifikasi status keaktifan pegawai secara daring.
        </p>
      </div>

      {/* Preview Kartu 2 Sisi */}
      <div className="flex flex-wrap gap-8 justify-center sm:justify-start print:gap-6 print:justify-start">
        {/* Sisi Depan */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider print:hidden">
            Sisi Depan
          </p>
          <div
            className="w-[340px] h-[214px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white text-slate-900 flex flex-col justify-between relative"
            style={{ breakInside: "avoid" }}
          >
            {/* Header Kartu */}
            <div
              className="px-4 py-3 text-white flex items-center gap-2.5"
              style={{ backgroundColor: accent }}
            >
              {appConfig?.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={appConfig.logoUrl}
                  alt={orgTitle}
                  className="h-8 w-8 object-contain rounded bg-white p-0.5 flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest opacity-80 leading-tight">
                  Kartu Tanda Pegawai
                </p>
                <p className="text-xs font-bold truncate leading-tight mt-0.5">
                  {orgTitle}
                </p>
              </div>
            </div>

            {/* Body Kartu */}
            <div className="px-4 py-3 flex items-center gap-3.5 flex-1">
              <Avatar className="h-20 w-16 rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
                {employee.profilePhoto && (
                  <AvatarImage
                    src={employee.profilePhoto}
                    alt={employee.fullName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="rounded-lg bg-slate-100 text-slate-600 text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-bold leading-tight text-slate-900 line-clamp-2">
                  {employee.fullName}
                </p>
                <p className="text-[11px] font-mono font-semibold text-slate-700">
                  NIP: {employee.employeeIdNumber}
                </p>
                <p className="text-[11px] text-slate-600 truncate">
                  {employee.position?.name ?? "Pegawai"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {employee.department?.name ?? "-"}
                </p>
              </div>
            </div>

            {/* Footer Kartu */}
            <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">
                {employee.joinDate
                  ? `Bergabung: ${format(new Date(employee.joinDate), "MMM yyyy", { locale: localeId })}`
                  : "ID Card Resmi"}
              </span>
              <Badge
                variant="secondary"
                className={
                  employee.employmentStatus === "AKTIF"
                    ? "bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0"
                    : "bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0"
                }
              >
                {employee.employmentStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Sisi Belakang */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider print:hidden">
            Sisi Belakang (QR Verifikasi)
          </p>
          <div
            className="w-[340px] h-[214px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white text-slate-900 flex flex-col justify-between"
            style={{ breakInside: "avoid" }}
          >
            <div
              className="h-3 w-full"
              style={{ backgroundColor: accent }}
            />

            <div className="px-4 py-2 flex items-center gap-3.5 flex-1">
              <div className="p-1.5 rounded-lg border border-slate-200 bg-white flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="QR Verifikasi Pegawai"
                  className="h-24 w-24"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1.5 text-[10px] text-slate-600 leading-relaxed">
                <p className="font-bold text-xs text-slate-900">Verifikasi Keaslian</p>
                <p>
                  Pindai QR Code ini untuk memverifikasi status kepegawaian aktif secara daring.
                </p>
                <p className="text-[9px] text-slate-400 break-all line-clamp-2">
                  {verifyUrl}
                </p>
              </div>
            </div>

            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[9px] text-slate-500 flex items-center justify-between gap-2">
              <span className="truncate">{appConfig?.address || orgTitle}</span>
              {appConfig?.phone && <span className="flex-shrink-0">{appConfig.phone}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
