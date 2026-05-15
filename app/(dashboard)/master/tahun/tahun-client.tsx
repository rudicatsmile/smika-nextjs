"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Loader2, Calendar } from "lucide-react"
import { toast } from "sonner"
import { createYear, updateYear, deleteYear } from "@/server/actions/master"

interface YearItem {
  id: string
  name: string
  order: number
  isActive: boolean
}

export function TahunClient({ initialData }: { initialData: YearItem[] }) {
  const [data, setData] = useState<YearItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<YearItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    name: string
    order: string
    isActive: boolean
  }>({
    name: "",
    order: "0",
    isActive: true,
  })
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setData(initialData)
    setMounted(true)
  }, [initialData])

  if (!mounted) return null

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Nama tahun wajib diisi")
      return
    }
    setIsPending(true)
    try {
      if (editItem) {
        const result = await updateYear(editItem.id, {
          name: form.name,
          order: parseInt(form.order),
          isActive: form.isActive,
        })
        if (result.success) {
          setData(data.map((item) => (item.id === editItem.id ? { ...item, ...form, order: parseInt(form.order) } : item)))
          toast.success("Tahun berhasil diperbarui")
          setDialogOpen(false)
          setEditItem(null)
        } else {
          toast.error(result.error || "Gagal memperbarui")
        }
      } else {
        const result = await createYear({
          name: form.name,
          order: parseInt(form.order),
        })
        if (result.success) {
          const newItem: YearItem = {
            id: result.id,
            name: form.name,
            order: parseInt(form.order),
            isActive: true,
          }
          setData([...data, newItem].sort((a, b) => a.order - b.order))
          toast.success("Tahun berhasil ditambahkan")
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
      const result = await deleteYear(deleteId)
      if (result.success) {
        setData(data.filter((item) => item.id !== deleteId))
        toast.success("Tahun berhasil dihapus")
        setDeleteId(null)
      } else {
        toast.error(result.error || "Gagal menghapus")
      }
    } finally {
      setIsPending(false)
    }
  }

  const openDialog = (item?: YearItem) => {
    if (item) {
      setEditItem(item)
      setForm({
        name: item.name,
        order: item.order.toString(),
        isActive: item.isActive,
      })
    } else {
      setEditItem(null)
      setForm({
        name: "",
        order: (data.length + 1).toString(),
        isActive: true,
      })
    }
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Master Data Tahun</h1>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tahun</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada data tahun
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-muted-foreground w-8">#{item.order}</span>
                    <span className="font-medium">{item.name}</span>
                    {!item.isActive && (
                      <span className="text-xs text-muted-foreground">(Non-aktif)</span>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Tahun" : "Tambah Tahun"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="order">Urutan</Label>
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                placeholder="1"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Tahun</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="2024/2025, 2025/2026, dll."
              />
            </div>
            {editItem && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            )}
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
            <AlertDialogTitle>Hapus Tahun</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tahun ini? Tindakan ini tidak dapat dibatalkan.
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
    </div>
  )
}
