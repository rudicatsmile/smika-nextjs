"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FilePenLine,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Trash2,
  Loader2,
  ArrowRight,
  UserCheck,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import {
  CORRECTION_FIELD_OPTIONS,
  getCorrectionFieldOption,
} from "@/lib/correction-fields"
import {
  submitDataCorrectionRequest,
  cancelDataCorrectionRequest,
  reviewDataCorrectionRequest,
} from "@/server/actions/data-correction"
import { cn } from "@/lib/utils"

interface CorrectionRequestItem {
  id: string
  employeeId: string
  employeeName: string
  employeeNip: string
  departmentName: string
  fieldKey: string
  fieldLabel: string
  oldValue: string
  newValue: string
  rawNewValue: string
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  reviewedByName: string | null
  reviewNote: string | null
  reviewedAt: string | null
  createdAt: string
}

interface PengajuanKoreksiClientProps {
  isReviewer: boolean
  isUnitScoped: boolean
  lockedDepartmentName: string | null
  myEmployee: {
    id: string
    fullName: string
    nip: string
    currentValues: Record<string, string>
  } | null
  myRequests: CorrectionRequestItem[]
  reviewQueue: CorrectionRequestItem[]
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Menunggu",
    icon: Clock,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  APPROVED: {
    label: "Disetujui",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  REJECTED: {
    label: "Ditolak",
    icon: XCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
}

export function PengajuanKoreksiClient({
  isReviewer,
  isUnitScoped,
  lockedDepartmentName,
  myEmployee,
  myRequests,
  reviewQueue,
}: PengajuanKoreksiClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form Dialog State
  const [formOpen, setFormOpen] = useState(false)
  const [fieldKey, setFieldKey] = useState<string>(CORRECTION_FIELD_OPTIONS[0].key)
  const [newValue, setNewValue] = useState("")
  const [reason, setReason] = useState("")

  // Review Dialog State
  const [reviewTarget, setReviewTarget] = useState<{
    item: CorrectionRequestItem
    decision: "APPROVED" | "REJECTED"
  } | null>(null)
  const [reviewNote, setReviewNote] = useState("")

  // Filter Review Queue
  const [statusFilter, setStatusFilter] = useState<string>("PENDING")

  const selectedField = useMemo(() => getCorrectionFieldOption(fieldKey), [fieldKey])
  const currentFieldValue = myEmployee?.currentValues[fieldKey] ?? "-"

  const pendingReviewCount = useMemo(
    () => reviewQueue.filter((r) => r.status === "PENDING").length,
    [reviewQueue]
  )

  const filteredQueue = useMemo(() => {
    if (statusFilter === "ALL") return reviewQueue
    return reviewQueue.filter((r) => r.status === statusFilter)
  }, [reviewQueue, statusFilter])

  const handleFieldChange = (val: string) => {
    setFieldKey(val)
    setNewValue("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await submitDataCorrectionRequest({
        fieldKey,
        newValue,
        reason,
      })
      if (!res.success) {
        toast.error(res.error ?? "Gagal mengirim pengajuan.")
        return
      }
      toast.success("Pengajuan koreksi data berhasil dikirim ke HR.")
      setFormOpen(false)
      setNewValue("")
      setReason("")
      router.refresh()
    })
  }

  const handleCancel = (id: string) => {
    startTransition(async () => {
      const res = await cancelDataCorrectionRequest(id)
      if (!res.success) {
        toast.error(res.error ?? "Gagal membatalkan pengajuan.")
        return
      }
      toast.success("Pengajuan koreksi dibatalkan.")
      router.refresh()
    })
  }

  const handleConfirmReview = () => {
    if (!reviewTarget) return
    startTransition(async () => {
      const res = await reviewDataCorrectionRequest({
        requestId: reviewTarget.item.id,
        decision: reviewTarget.decision,
        reviewNote,
      })
      if (!res.success) {
        toast.error(res.error ?? "Gagal memproses review.")
        return
      }
      toast.success(
        reviewTarget.decision === "APPROVED"
          ? "Pengajuan disetujui dan data pegawai diperbarui."
          : "Pengajuan ditolak."
      )
      setReviewTarget(null)
      setReviewNote("")
      router.refresh()
    })
  }

  const renderRequestCard = (item: CorrectionRequestItem, mode: "self" | "review") => {
    const cfg = STATUS_CONFIG[item.status]
    const StatusIcon = cfg.icon

    return (
      <Card key={item.id}>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm">{item.fieldLabel}</span>
                <Badge className={cn("text-xs font-medium", cfg.className)} variant="secondary">
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {cfg.label}
                </Badge>
              </div>
              {mode === "review" && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  <Link href={`/pegawai/${item.employeeId}`} className="font-medium hover:underline text-foreground">
                    {item.employeeName}
                  </Link>{" "}
                  · {item.employeeNip} · {item.departmentName}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
            </span>
          </div>

          <div className="grid sm:grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg bg-muted/40 p-3 text-sm">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Data Lama</p>
              <p className="font-medium break-words">{item.oldValue}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-primary">Data Baru (Usulan)</p>
              <p className="font-semibold text-primary break-words">{item.newValue}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Alasan:</span> {item.reason}
          </div>

          {item.status !== "PENDING" && (
            <div className="text-xs rounded-md border px-3 py-2 bg-card space-y-0.5">
              <p className="text-muted-foreground">
                Ditinjau oleh <span className="font-medium text-foreground">{item.reviewedByName ?? "HR"}</span>
                {item.reviewedAt
                  ? ` pada ${format(new Date(item.reviewedAt), "dd MMM yyyy, HH:mm", { locale: localeId })}`
                  : ""}
              </p>
              {item.reviewNote && (
                <p>
                  <span className="font-medium">Catatan:</span> {item.reviewNote}
                </p>
              )}
            </div>
          )}

          {mode === "self" && item.status === "PENDING" && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive h-8 text-xs"
                onClick={() => handleCancel(item.id)}
                disabled={isPending}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Batalkan Pengajuan
              </Button>
            </div>
          )}

          {mode === "review" && item.status === "PENDING" && (
            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 text-xs"
                onClick={() => {
                  setReviewNote("")
                  setReviewTarget({ item, decision: "REJECTED" })
                }}
                disabled={isPending}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Tolak
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  setReviewNote("")
                  setReviewTarget({ item, decision: "APPROVED" })
                }}
                disabled={isPending}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Setujui &amp; Terapkan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FilePenLine className="h-6 w-6 text-primary" />
            Koreksi Data Mandiri
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isReviewer
              ? `Kelola & setujui pengajuan pembaruan data pegawai${
                  isUnitScoped && lockedDepartmentName ? ` · Unit ${lockedDepartmentName}` : ""
                }`
              : "Ajukan pembaruan data pribadi Anda untuk diverifikasi oleh HR"}
          </p>
        </div>

        {myEmployee && (
          <Button onClick={() => setFormOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajukan Koreksi Data
          </Button>
        )}
      </div>

      {/* Info jika akun belum terhubung ke Employee */}
      {!myEmployee && !isReviewer && (
        <Card>
          <CardContent className="py-12 text-center space-y-2 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto opacity-40" />
            <p className="font-medium text-foreground">Akun belum terhubung ke data pegawai</p>
            <p className="text-sm">Silakan hubungi administrator untuk menghubungkan akun Anda dengan profil pegawai.</p>
          </CardContent>
        </Card>
      )}

      {/* Konten utama */}
      {isReviewer ? (
        <Tabs defaultValue="review">
          <TabsList>
            <TabsTrigger value="review">
              Antrean Persetujuan HR
              {pendingReviewCount > 0 && (
                <Badge className="ml-1.5 bg-amber-500 text-white hover:bg-amber-500 text-[10px]">
                  {pendingReviewCount}
                </Badge>
              )}
            </TabsTrigger>
            {myEmployee && (
              <TabsTrigger value="mine">
                Pengajuan Saya
                <Badge variant="secondary" className="ml-1.5 text-[10px]">
                  {myRequests.length}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="review" className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Menampilkan {filteredQueue.length} pengajuan
              </p>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Menunggu ({pendingReviewCount})</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredQueue.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  Tidak ada pengajuan koreksi pada status ini.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredQueue.map((item) => renderRequestCard(item, "review"))}
              </div>
            )}
          </TabsContent>

          {myEmployee && (
            <TabsContent value="mine" className="mt-4 space-y-3">
              {myRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground text-sm">
                    Anda belum pernah mengajukan koreksi data.
                  </CardContent>
                </Card>
              ) : (
                myRequests.map((item) => renderRequestCard(item, "self"))
              )}
            </TabsContent>
          )}
        </Tabs>
      ) : (
        myEmployee && (
          <div className="space-y-4">
            <Card className="bg-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  {myEmployee.fullName} ({myEmployee.nip})
                </CardTitle>
                <CardDescription className="text-xs">
                  Perubahan data yang Anda ajukan akan langsung memperbarui profil setelah disetujui oleh HR.
                </CardDescription>
              </CardHeader>
            </Card>

            {myRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center space-y-3">
                  <FilePenLine className="h-10 w-10 mx-auto text-muted-foreground/30" />
                  <div>
                    <p className="font-medium text-sm">Belum ada riwayat pengajuan koreksi</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Klik tombol &quot;Ajukan Koreksi Data&quot; di atas jika ada data pribadi Anda yang perlu diperbarui.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myRequests.map((item) => renderRequestCard(item, "self"))}
              </div>
            )}
          </div>
        )
      )}

      {/* Dialog Ajukan Koreksi */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajukan Koreksi Data Mandiri</DialogTitle>
            <DialogDescription>
              Pilih bagian data yang ingin diperbaiki, isi nilai baru, dan cantumkan alasannya.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Data yang Dikoreksi</Label>
              <Select value={fieldKey} onValueChange={handleFieldChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CORRECTION_FIELD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Data Saat Ini</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                {currentFieldValue}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Data Baru (Usulan) *</Label>
              {selectedField?.inputType === "textarea" ? (
                <Textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={selectedField.placeholder}
                  rows={3}
                  required
                />
              ) : selectedField?.inputType === "select" ? (
                <Select value={newValue} onValueChange={setNewValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status baru" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedField.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={selectedField?.inputType ?? "text"}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={selectedField?.placeholder}
                  required
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Alasan Perubahan *</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Nomor HP lama sudah tidak aktif / pindah alamat domisili"
                rows={2}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Kirim Pengajuan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Review HR */}
      <Dialog
        open={Boolean(reviewTarget)}
        onOpenChange={(open) => !open && setReviewTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewTarget?.decision === "APPROVED"
                ? "Setujui & Terapkan Koreksi"
                : "Tolak Pengajuan Koreksi"}
            </DialogTitle>
            <DialogDescription>
              {reviewTarget?.decision === "APPROVED"
                ? `Data ${reviewTarget.item.fieldLabel} milik ${reviewTarget.item.employeeName} akan langsung diperbarui menjadi "${reviewTarget.item.newValue}".`
                : `Berikan alasan penolakan untuk pengajuan ${reviewTarget?.item.fieldLabel} milik ${reviewTarget?.item.employeeName}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>
              Catatan HR {reviewTarget?.decision === "REJECTED" ? "*" : "(Opsional)"}
            </Label>
            <Textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={
                reviewTarget?.decision === "APPROVED"
                  ? "Contoh: Sudah diverifikasi sesuai dokumen pendukung"
                  : "Contoh: Nomor NIK tidak sesuai dengan scan KTP"
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewTarget(null)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant={reviewTarget?.decision === "REJECTED" ? "destructive" : "default"}
              onClick={handleConfirmReview}
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {reviewTarget?.decision === "APPROVED" ? "Ya, Setujui & Terapkan" : "Tolak Pengajuan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
