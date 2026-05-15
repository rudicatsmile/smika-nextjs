"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Loader2, FileText, Calendar, Download } from "lucide-react"
import { toast } from "sonner"
import { createEmploymentDocument, updateEmploymentDocument, deleteEmploymentDocument } from "@/server/actions/employment-document"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface EmploymentDocumentItem {
  id: string
  employeeId: string
  letterName: string
  date?: string
  number?: string
  description?: string
  file?: string
}

export function EmploymentDocumentTable({ employeeId, initialData }: {
  employeeId: string
  initialData: EmploymentDocumentItem[]
}) {
  const [data, setData] = useState<EmploymentDocumentItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<EmploymentDocumentItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    letterName: string
    date: string
    number: string
    description: string
    file: string
  }>({
    letterName: "",
    date: "",
    number: "",
    description: "",
    file: "",
  })
  const [isPending, setIsPending] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  useEffect(() => {
    setData(initialData)
    setMounted(true)
  }, [initialData])

  if (!mounted) return null

  const handleSubmit = async () => {
    if (!form.letterName) {
      toast.error("Nama surat kepegawaian wajib diisi")
      return
    }
    setIsPending(true)
    try {
      if (editItem) {
        const result = await updateEmploymentDocument(editItem.id, {
          letterName: form.letterName,
          date: form.date || undefined,
          number: form.number || undefined,
          description: form.description || undefined,
          file: form.file || undefined,
        })
        if (result.success) {
          setData(data.map((item) => (item.id === editItem.id ? {
            ...item,
            letterName: form.letterName,
            date: form.date || undefined,
            number: form.number || undefined,
            description: form.description || undefined,
            file: form.file || undefined,
          } : item)))
          toast.success("Riwayat kepegawaian berhasil diperbarui")
          setDialogOpen(false)
          setEditItem(null)
        } else {
          toast.error(result.error || "Gagal memperbarui")
        }
      } else {
        const result = await createEmploymentDocument({
          employeeId,
          letterName: form.letterName,
          date: form.date || undefined,
          number: form.number || undefined,
          description: form.description || undefined,
          file: form.file || undefined,
        })
        if (result.success) {
          const newItem: EmploymentDocumentItem = {
            id: result.id,
            employeeId,
            letterName: form.letterName,
            date: form.date || undefined,
            number: form.number || undefined,
            description: form.description || undefined,
            file: form.file || undefined,
          }
          setData([...data, newItem])
          toast.success("Riwayat kepegawaian berhasil ditambahkan")
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
      const result = await deleteEmploymentDocument(deleteId)
      if (result.success) {
        setData(data.filter((item) => item.id !== deleteId))
        toast.success("Riwayat kepegawaian berhasil dihapus")
        setDeleteId(null)
      } else {
        toast.error(result.error || "Gagal menghapus")
      }
    } finally {
      setIsPending(false)
    }
  }

  const openDialog = (item?: EmploymentDocumentItem) => {
    if (item) {
      setEditItem(item)
      setForm({
        letterName: item.letterName,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        number: item.number || "",
        description: item.description || "",
        file: item.file || "",
      })
      setFilePreview(item.file || null)
    } else {
      setEditItem(null)
      setForm({
        letterName: "",
        date: "",
        number: "",
        description: "",
        file: "",
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
        setForm({ ...form, file: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Riwayat Kepegawaian
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
            Belum ada riwayat kepegawaian
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-lg">{item.letterName}</span>
                      {item.number && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">No. {item.number}</span>
                      )}
                    </div>
                    {item.date && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(item.date), "d MMMM yyyy", { locale: id })}</span>
                      </div>
                    )}
                    {item.description && (
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    )}
                    {item.file && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = item.file!
                          link.download = `surat-${item.letterName.replace(/\s+/g, '-')}.pdf`
                          link.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download File
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
            <DialogTitle>{editItem ? "Edit Riwayat Kepegawaian" : "Tambah Riwayat Kepegawaian"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="letterName">Nama Surat Kepegawaian</Label>
              <Input
                id="letterName"
                value={form.letterName}
                onChange={(e) => setForm({ ...form, letterName: e.target.value })}
                placeholder="Nama surat kepegawaian"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Nomor</Label>
                <Input
                  id="number"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  placeholder="123/XXX/2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Keterangan</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Keterangan surat..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              {filePreview && (
                <div className="flex items-center gap-2 mt-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">File terpilih</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilePreview(null)
                      setForm({ ...form, file: "" })
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
            <AlertDialogTitle>Hapus Riwayat Kepegawaian</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus riwayat kepegawaian ini? Tindakan ini tidak dapat dibatalkan.
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
