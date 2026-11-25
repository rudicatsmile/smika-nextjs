"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MessageCircle,
  Send,
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Users,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import {
  sendTestWhatsAppAction,
  broadcastWhatsAppAction,
} from "@/server/actions/whatsapp"

interface WhatsAppClientProps {
  isConfigured: boolean
  waEnabled: boolean
  waProvider: string
  departments: { id: string; name: string }[]
  isUnitScoped: boolean
  lockedDepartmentId: string | null
  lockedDepartmentName: string | null
  logs: Array<{
    id: string
    phoneNumber: string
    message: string
    provider: string
    status: string
    response: string | null
    createdAt: string
  }>
}

const TEMPLATES = [
  {
    label: "Pengingat Kelengkapan Berkas",
    text: "Assalamu'alaikum {nama} (NIP: {nip}). Mohon segera melengkapi dokumen penting kepegawaian (KTP, KK, Ijazah, BPJS, NPWP, SK) pada aplikasi SIMKA9. Terima kasih.",
  },
  {
    label: "Pengingat Form Kesediaan",
    text: "Assalamu'alaikum {nama} (NIP: {nip}). Diinformasikan untuk segera mengisi Form Kesediaan Mengajar pada aplikasi SIMKA9 sebelum batas waktu yang ditentukan. Terima kasih.",
  },
  {
    label: "Pemberitahuan Umum",
    text: "Assalamu'alaikum {nama}. Terdapat pembaruan informasi kepegawaian di aplikasi SIMKA9. Silakan login untuk melihat detailnya.",
  },
]

export function WhatsAppClient({
  isConfigured,
  waEnabled,
  waProvider,
  departments,
  isUnitScoped,
  lockedDepartmentId,
  lockedDepartmentName,
  logs,
}: WhatsAppClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Test Form
  const [testPhone, setTestPhone] = useState("")
  const [testMessage, setTestMessage] = useState(
    "Uji coba notifikasi WhatsApp Gateway SIMKA9 berhasil terhubung."
  )

  // Broadcast Form
  const [targetType, setTargetType] = useState<
    "ALL_ACTIVE" | "INCOMPLETE_DOCS" | "DEPARTMENT"
  >(isUnitScoped ? "DEPARTMENT" : "INCOMPLETE_DOCS")
  const [departmentId, setDepartmentId] = useState<string>(
    lockedDepartmentId ?? departments[0]?.id ?? ""
  )
  const [broadcastMessage, setBroadcastMessage] = useState(TEMPLATES[0].text)

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await sendTestWhatsAppAction({
        phoneNumber: testPhone,
        message: testMessage,
      })
      if (!res.success) {
        toast.error(res.error ?? "Gagal mengirim pesan uji coba.")
        return
      }
      toast.success("Pesan uji coba WhatsApp berhasil dikirim.")
      router.refresh()
    })
  }

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await broadcastWhatsAppAction({
        targetType,
        departmentId: targetType === "DEPARTMENT" ? departmentId : undefined,
        messageTemplate: broadcastMessage,
      })
      if (!res.success) {
        toast.error(res.error ?? "Gagal mengirim broadcast.")
        return
      }
      toast.success(
        `Broadcast selesai: ${res.sentCount} berhasil, ${res.failedCount} gagal dari ${res.totalTargets} target.`
      )
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="h-7 px-2 mb-1 text-muted-foreground">
            <Link href="/notifikasi">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali ke Notifikasi
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-green-600" />
            WhatsApp Gateway Notifikasi
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kirim pengingat kepegawaian &amp; pantau riwayat pengiriman WhatsApp
          </p>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href="/pengaturan">
            <Settings className="h-4 w-4 mr-2" />
            Pengaturan Gateway
          </Link>
        </Button>
      </div>

      {/* Status Banner */}
      <Card
        className={
          isConfigured
            ? "border-green-500/30 bg-green-50/40 dark:bg-green-950/20"
            : "border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20"
        }
      >
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isConfigured ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold">
                {isConfigured
                  ? `WhatsApp Gateway Aktif (${waProvider})`
                  : waEnabled
                  ? "API Token Gateway Belum Diisi"
                  : "WhatsApp Gateway Belum Diaktifkan"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isConfigured
                  ? "Siap mengirim notifikasi otomatis dan broadcast ke nomor HP pegawai."
                  : "Aktifkan dan masukkan API Token di menu Pengaturan agar pesan dapat terkirim."}
              </p>
            </div>
          </div>
          {!isConfigured && (
            <Button size="sm" variant="outline" asChild>
              <Link href="/pengaturan">Buka Pengaturan</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="broadcast">
        <TabsList>
          <TabsTrigger value="broadcast">Broadcast Pengingat</TabsTrigger>
          <TabsTrigger value="test">Uji Coba Kirim</TabsTrigger>
          <TabsTrigger value="logs">
            Riwayat Log
            <Badge variant="secondary" className="ml-1.5 text-[10px]">
              {logs.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab Broadcast */}
        <TabsContent value="broadcast" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Kirim Broadcast Pengingat WhatsApp
              </CardTitle>
              <CardDescription>
                Gunakan variabel <code className="bg-muted px-1 rounded">{"{nama}"}</code> dan{" "}
                <code className="bg-muted px-1 rounded">{"{nip}"}</code> untuk personalisasi otomatis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBroadcast} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Penerima</Label>
                    <Select
                      value={targetType}
                      onValueChange={(v) =>
                        setTargetType(v as "ALL_ACTIVE" | "INCOMPLETE_DOCS" | "DEPARTMENT")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOMPLETE_DOCS">
                          Pegawai Aktif — Berkas Belum Lengkap
                        </SelectItem>
                        <SelectItem value="ALL_ACTIVE">
                          Semua Pegawai Aktif {isUnitScoped ? "(Unit Ini)" : ""}
                        </SelectItem>
                        {!isUnitScoped && (
                          <SelectItem value="DEPARTMENT">Unit / Departemen Tertentu</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {!isUnitScoped && targetType === "DEPARTMENT" && (
                    <div className="space-y-2">
                      <Label>Pilih Departemen / Unit</Label>
                      <Select value={departmentId} onValueChange={setDepartmentId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {isUnitScoped && lockedDepartmentName && (
                    <div className="space-y-2">
                      <Label>Unit Terkunci</Label>
                      <div className="px-3 py-2 rounded-md border bg-muted/40 text-sm text-muted-foreground">
                        {lockedDepartmentName}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Template Cepat</Label>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATES.map((tpl) => (
                      <Button
                        key={tpl.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setBroadcastMessage(tpl.text)}
                      >
                        {tpl.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Isi Pesan WhatsApp *</Label>
                  <Textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" disabled={isPending || !isConfigured}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Kirim Broadcast Sekarang
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Test */}
        <TabsContent value="test" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Uji Coba Kirim Pesan</CardTitle>
              <CardDescription>
                Kirim 1 pesan percobaan untuk memastikan koneksi token WhatsApp Gateway berjalan lancar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendTest} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label>Nomor WhatsApp Tujuan *</Label>
                  <Input
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="Contoh: 081234567890 atau 6281234567890"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pesan *</Label>
                  <Textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <Button type="submit" disabled={isPending || !isConfigured}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Kirim Uji Coba
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Logs */}
        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Riwayat Pengiriman WhatsApp</CardTitle>
              <CardDescription>50 log pengiriman terbaru</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  Belum ada riwayat pengiriman pesan WhatsApp.
                </p>
              ) : (
                <div className="divide-y">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold">
                            {log.phoneNumber}
                          </span>
                          <Badge
                            variant="secondary"
                            className={
                              log.status === "SENT"
                                ? "bg-green-100 text-green-700 text-[10px]"
                                : "bg-red-100 text-red-700 text-[10px]"
                            }
                          >
                            {log.status === "SENT" ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {log.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {log.provider}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{log.message}</p>
                        {log.status === "FAILED" && log.response && (
                          <p className="text-[11px] text-red-600 truncate">
                            Respons: {log.response}
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0">
                        {format(new Date(log.createdAt), "dd MMM, HH:mm", { locale: localeId })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
