"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Download, CheckCircle2, XCircle, Loader2, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import * as XLSX from "xlsx"

interface PreviewRow {
  employeeIdNumber: string
  fullName: string
  email?: string
  phoneNumber?: string
  gender?: string
  status: "valid" | "error"
  error?: string
}

export default function ImportPegawaiPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: "binary" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" })

      const parsed: PreviewRow[] = rows.slice(0, 100).map((r) => {
        const nip = String(r["NIP"] || r["nip"] || r["Nomor NIP"] || "").trim()
        const nama = String(r["Nama Lengkap"] || r["fullName"] || r["nama"] || "").trim()
        if (!nip || !nama) {
          return { employeeIdNumber: nip, fullName: nama, status: "error", error: "NIP dan Nama wajib" }
        }
        return {
          employeeIdNumber: nip,
          fullName: nama,
          email: String(r["Email"] || "").trim() || undefined,
          phoneNumber: String(r["No. Telepon"] || "").trim() || undefined,
          gender: String(r["Jenis Kelamin"] || "").trim() || undefined,
          status: "valid",
        }
      })
      setPreview(parsed)
    }
    reader.readAsBinaryString(f)
  }

  const handleImport = async () => {
    const validRows = preview.filter((r) => r.status === "valid")
    if (!validRows.length) return
    setImporting(true)
    try {
      const res = await fetch("/api/pegawai/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      })
      const json = await res.json()
      if (res.ok) {
        toast.success(`${json.created} pegawai berhasil diimpor!`)
        router.push("/pegawai")
      } else {
        toast.error(json.message || "Gagal mengimpor")
      }
    } catch {
      toast.error("Terjadi kesalahan")
    } finally {
      setImporting(false)
    }
  }

  const validCount = preview.filter((r) => r.status === "valid").length
  const errorCount = preview.filter((r) => r.status === "error").length

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pegawai"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-bold">Import Data Pegawai</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">1. Unduh Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Download template Excel berikut, isi data pegawai sesuai format, lalu upload.
            </p>
            <a href="/api/pegawai/template">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />Unduh Template Excel
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">2. Upload File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "Klik atau drag file .xlsx di sini"}
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </CardContent>
        </Card>
      </div>

      {preview.length > 0 && (
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm">Preview Data ({preview.length} baris)</CardTitle>
            <div className="flex gap-2">
              {validCount > 0 && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />{validCount} valid
                </Badge>
              )}
              {errorCount > 0 && (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />{errorCount} error
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">NIP</th>
                    <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Nama</th>
                    <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Email</th>
                    <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 px-3 font-mono">{row.employeeIdNumber || "-"}</td>
                      <td className="py-2 px-3">{row.fullName || "-"}</td>
                      <td className="py-2 px-3 text-muted-foreground">{row.email || "-"}</td>
                      <td className="py-2 px-3">
                        {row.status === "valid" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-xs text-destructive">{row.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleImport} disabled={importing || validCount === 0}>
                {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Import {validCount} Pegawai
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
