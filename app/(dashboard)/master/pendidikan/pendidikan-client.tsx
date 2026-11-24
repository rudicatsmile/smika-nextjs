"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { createEducation, updateEducation, deleteEducation } from "@/server/actions/master"

interface EducationItem {
  id: string
  name: string
  level: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export function PendidikanClient({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState<EducationItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<EducationItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<{ name: string; level: string; order: string }>({
    name: "",
    level: "",
    order: "1",
  })
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const sorted = [...(initialData as EducationItem[])].sort((a, b) => (a.order || 0) - (b.order || 0))
    setData(sorted)
    setMounted(true)
  }, [initialData])

  if (!mounted) return null

  const filtered = data.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.level.toLowerCase().includes(search.toLowerCase()) ||
    (i.order?.toString() || "").includes(search)
  )

  const handleSubmit = async () => {
    if (!form.name || !form.level) {
      toast.error("Nama dan level wajib diisi")
      return
    }
    const orderNum = parseInt(form.order) || 0
    setIsPending(true)
    try {
      if (editItem) {
        const result = await updateEducation(editItem.id, {
          name: form.name,
          level: form.level,
          order: orderNum,
        })
        if (result.success) {
          setData(
            data
              .map((item) =>
                item.id === editItem.id ? { ...item, name: form.name, level: form.level, order: orderNum } : item
              )
              .sort((a, b) => (a.order || 0) - (b.order || 0))
          )
          toast.success("Data berhasil diperbarui")
          setDialogOpen(false)
          setEditItem(null)
        } else {
          toast.error(result.error || "Gagal memperbarui")
        }
      } else {
        const result = await createEducation({
          name: form.name,
          level: form.level,
          order: orderNum,
        })
        if (result.success) {
          const newItem: EducationItem = {
            id: result.id,
            name: form.name,
            level: form.level,
            order: orderNum,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          setData([...data, newItem].sort((a, b) => (a.order || 0) - (b.order || 0)))
          toast.success("Data berhasil ditambahkan")
          setDialogOpen(false)
        } else {
          toast.error(result.error || "Gagal menyimpan")
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
      const result = await deleteEducation(deleteId)
      if (result.success) {
        setData(data.filter((item) => item.id !== deleteId))
        toast.success("Data berhasil dihapus")
        setDeleteId(null)
      } else {
        toast.error(result.error || "Gagal menghapus")
      }
    } finally {
      setIsPending(false)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const item = data.find((d) => d.id === id)
    if (!item) return
    setIsPending(true)
    try {
      const result = await updateEducation(id, {
        name: item.name,
        level: item.level,
        order: item.order,
        isActive,
      })
      if (result.success) {
        setData(data.map((i) => (i.id === id ? { ...i, isActive } : i)))
      } else {
        toast.error(result.error || "Gagal mengubah status")
      }
    } finally {
      setIsPending(false)
    }
  }

  const openDialog = (item?: EducationItem) => {
    if (item) {
      setEditItem(item)
      setForm({
        name: item.name,
        level: item.level,
        order: (item.order ?? 0).toString(),
      })
    } else {
      setEditItem(null)
      const nextOrder = data.length > 0 ? Math.max(...data.map((d) => d.order || 0)) + 1 : 1
      setForm({
        name: "",
        level: "",
        order: nextOrder.toString(),
      })
    }
    setDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Master Data Pendidikan</CardTitle>
          <Button onClick={() => openDialog()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pendidikan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-center p-3 font-medium w-20">Urutan</th>
                <th className="text-left p-3 font-medium">Nama</th>
                <th className="text-left p-3 font-medium">Level</th>
                <th className="text-center p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold bg-muted text-muted-foreground border">
                      #{item.order}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">{item.level}</td>
                  <td className="p-3 text-center">
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={(checked) => handleToggleActive(item.id, checked)}
                      disabled={isPending}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Pendidikan" : "Tambah Pendidikan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="order">Urutan Tampilan</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                placeholder="1, 2, 3..."
              />
              <p className="text-[11px] text-muted-foreground">
                Menentukan urutan prioritas kemunculan data di tabel dan pilihan dropdown
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Pendidikan</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="S1, D3, dll"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                placeholder="SD, SMP, Diploma, Sarjana"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pendidikan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pendidikan ini? Tindakan ini tidak dapat dibatalkan.
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
