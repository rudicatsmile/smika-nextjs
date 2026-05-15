"use client"

import { useState, useTransition } from "react"
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

export interface MasterItem {
  id: string
  name: string
  code?: string
  description?: string
  isActive: boolean
}

interface MasterTableProps {
  title: string
  items: MasterItem[]
  hasCode?: boolean
  hasDescription?: boolean
  onAdd: (data: Partial<MasterItem>) => Promise<{ error?: string; success?: boolean }>
  onEdit: (id: string, data: Partial<MasterItem>) => Promise<{ error?: string; success?: boolean }>
  onDelete: (id: string) => Promise<{ error?: string; success?: boolean }>
}

export function MasterTable({
  title, items, hasCode, hasDescription, onAdd, onEdit, onDelete,
}: MasterTableProps) {
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<MasterItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<MasterItem>>({})
  const [isPending, startTransition] = useTransition()

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.code ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditItem(null)
    setForm({})
    setDialogOpen(true)
  }

  const openEdit = (item: MasterItem) => {
    setEditItem(item)
    setForm({ name: item.name, code: item.code, description: item.description, isActive: item.isActive })
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name?.trim()) { toast.error("Nama wajib diisi"); return }
    startTransition(async () => {
      const result = editItem
        ? await onEdit(editItem.id, form)
        : await onAdd(form)
      if (result.error) toast.error(result.error)
      else {
        toast.success(editItem ? "Berhasil diperbarui" : "Berhasil ditambahkan")
        setDialogOpen(false)
      }
    })
  }

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      const result = await onDelete(deleteId)
      if (result.error) toast.error(result.error)
      else toast.success("Berhasil dihapus")
      setDeleteId(null)
    })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1.5" />Tambah
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {hasCode ? "Kode" : "#"}
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama</th>
                {hasDescription && (
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Deskripsi</th>
                )}
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filtered.map((item, i) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">
                      {hasCode ? (item.code ?? "-") : i + 1}
                    </td>
                    <td className="px-4 py-2.5 font-medium">{item.name}</td>
                    {hasDescription && (
                      <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">
                        {item.description ?? "-"}
                      </td>
                    )}
                    <td className="px-4 py-2.5">
                      <Badge
                        variant="secondary"
                        className={item.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-muted text-muted-foreground"}
                      >
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!isPending) setDialogOpen(o) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? `Edit ${title}` : `Tambah ${title}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {hasCode && (
              <div className="space-y-1.5">
                <Label>Kode <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Kode unik (e.g. MTS)"
                  value={form.code ?? ""}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Nama <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Nama..."
                value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            {hasDescription && (
              <div className="space-y-1.5">
                <Label>Deskripsi</Label>
                <Input
                  placeholder="Deskripsi opsional"
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            )}
            {editItem && (
              <div className="flex items-center gap-3">
                <Switch
                  id="isActive"
                  checked={form.isActive ?? true}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Data tidak dapat dipulihkan. Pastikan data ini tidak sedang digunakan oleh pegawai.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
