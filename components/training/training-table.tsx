"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, Edit, Trash2, Loader2, Award, Calendar, MapPin, FileText, Download } from "lucide-react"
import { toast } from "sonner"
import { createTraining, updateTraining, deleteTraining } from "@/server/actions/training"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface TrainingItem {
  id: string
  employeeId: string
  name: string
  type: string
  organizerLocation?: string
  batch?: string
  date?: string
  certificateNumber?: string
  certificateDate?: string
  certificateFile?: string
}

const TRAINING_TYPES = [
  "Kepemimpinan/Struktural",
  "Fungsional",
  "Teknis",
]

export function TrainingTable({ employeeId, initialData }: {
  employeeId: string
  initialData: TrainingItem[]
}) {
  const [data, setData] = useState<TrainingItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<TrainingItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    name: string
    type: string
    organizerLocation: string
    batch: string
    date: string
    certificateNumber: string
    certificateDate: string
    certificateFile: string
  }>({
    name: "",
    type: "",
    organizerLocation: "",
    batch: "",
    date: "",
    certificateNumber: "",
    certificateDate: "",
    certificateFile: "",
  })
  const [isPending, setIsPending] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  useEffect(() => {
    setData(initialData)
    setMounted(true)
  }, [initialData])

  if (!mounted) return null

  const handleSubmit = async () => {
    if (!form.name || !form.type) {
      toast.error("Nama pelatihan dan jenis pelatihan wajib diisi")
      return
    }
    setIsPending(true)
    try {
      if (editItem) {
        const result = await updateTraining(editItem.id, {
          name: form.name,
          type: form.type,
          organizerLocation: form.organizerLocation || undefined,
          batch: form.batch || undefined,
          date: form.date || undefined,
          certificateNumber: form.certificateNumber || undefined,
          certificateDate: form.certificateDate || undefined,
          certificateFile: form.certificateFile || undefined,
        })
        if (result.success) {
          setData(data.map((item) => (item.id === editItem.id ? {
            ...item,
            name: form.name,
            type: form.type,
            organizerLocation: form.organizerLocation || undefined,
            batch: form.batch || undefined,
            date: form.date || undefined,
            certificateNumber: form.certificateNumber || undefined,
            certificateDate: form.certificateDate || undefined,
            certificateFile: form.certificateFile || undefined,
          } : item)))
          toast.success("Data pelatihan berhasil diperbarui")
          setDialogOpen(false)
          setEditItem(null)
        } else {
          toast.error(result.error || "Gagal memperbarui")
        }
      } else {
        const result = await createTraining({
          employeeId,
          name: form.name,
          type: form.type,
          organizerLocation: form.organizerLocation || undefined,
          batch: form.batch || undefined,
          date: form.date || undefined,
          certificateNumber: form.certificateNumber || undefined,
          certificateDate: form.certificateDate || undefined,
          certificateFile: form.certificateFile || undefined,
        })
        if (result.success) {
          const newItem: TrainingItem = {
            id: result.id,
            employeeId,
            name: form.name,
            type: form.type,
            organizerLocation: form.organizerLocation || undefined,
            batch: form.batch || undefined,
            date: form.date || undefined,
            certificateNumber: form.certificateNumber || undefined,
            certificateDate: form.certificateDate || undefined,
            certificateFile: form.certificateFile || undefined,
          }
          setData([...data, newItem])
          toast.success("Data pelatihan berhasil ditambahkan")
          setDialogOpen(false)
        } else {
          toast.error(result.error || "Gagal menambahkan")
        }
      }
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsPending(true)
    try {
      const result = await deleteTraining(deleteId)
      if (result.success) {
        setData(data.filter((item) => item.id !== deleteId))
        toast.success("Data pelatihan berhasil dihapus")
        setDeleteId(null)
      } else {
        toast.error(result.error || "Gagal menghapus")
      }
    } finally {
      setIsPending(false)
    }
  }

  const openDialog = (item?: TrainingItem) => {
    if (item) {
      setEditItem(item)
      setForm({
        name: item.name,
        type: item.type,
        organizerLocation: item.organizerLocation || "",
        batch: item.batch || "",
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        certificateNumber: item.certificateNumber || "",
        certificateDate: item.certificateDate ? new Date(item.certificateDate).toISOString().split('T')[0] : "",
        certificateFile: item.certificateFile || "",
      })
      setFilePreview(item.certificateFile || null)
    } else {
      setEditItem(null)
      setForm({
        name: "",
        type: "",
        organizerLocation: "",
        batch: "",
        date: "",
        certificateNumber: "",
        certificateDate: "",
        certificateFile: "",
      })
      setFilePreview(null)
    }
    setDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFilePreview(base64)
        setForm({ ...form, certificateFile: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Pelatihan
          </CardTitle>
          <Button onClick={() => openDialog()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Belum ada data pelatihan
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-lg">{item.name}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{item.type}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {item.organizerLocation && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{item.organizerLocation}</span>
                        </div>
                      )}
                      {item.batch && (
                        <div className="flex items-center gap-1">
                          <span>Angkatan: {item.batch}</span>
                        </div>
                      )}
                      {item.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(new Date(item.date), "d MMMM yyyy", { locale: id })}</span>
                        </div>
                      )}
                    </div>
                    {(item.certificateNumber || item.certificateDate) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {item.certificateNumber && <div>No. Sertifikat: {item.certificateNumber}</div>}
                        {item.certificateDate && (
                          <div>Tgl. Sertifikat: {format(new Date(item.certificateDate), "d MMM yyyy", { locale: id })}</div>
                        )}
                      </div>
                    )}
                    {item.certificateFile && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = item.certificateFile!
                          link.download = `sertifikat-${item.name.replace(/\s+/g, '-')}.pdf`
                          link.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Sertifikat
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Data Pelatihan" : "Tambah Data Pelatihan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Pelatihan</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama pelatihan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Jenis Pelatihan</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis pelatihan" />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizerLocation">Tempat Penyelenggara</Label>
                <Input
                  id="organizerLocation"
                  value={form.organizerLocation}
                  onChange={(e) => setForm({ ...form, organizerLocation: e.target.value })}
                  placeholder="Jakarta"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Angkatan</Label>
                <Input
                  id="batch"
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  placeholder="X"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal Pelatihan</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certificateNumber">Nomor Sertifikat</Label>
                <Input
                  id="certificateNumber"
                  value={form.certificateNumber}
                  onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })}
                  placeholder="123/SRT/2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificateDate">Tanggal Sertifikat</Label>
                <Input
                  id="certificateDate"
                  type="date"
                  value={form.certificateDate}
                  onChange={(e) => setForm({ ...form, certificateDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificateFile">File Sertifikat</Label>
              <Input
                id="certificateFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              {filePreview && (
                <div className="flex items-center gap-2 mt-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">File sertifikat terpilih</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilePreview(null)
                      setForm({ ...form, certificateFile: "" })
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Pelatihan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pelatihan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
