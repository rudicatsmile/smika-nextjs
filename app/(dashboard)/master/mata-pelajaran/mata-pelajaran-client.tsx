"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { createSubject, updateSubject, deleteSubject } from "@/server/actions/master"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"

interface Subject {
  id: string
  name: string
  urutan: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface MataPelajaranClientProps {
  subjects: Subject[]
}

export function MataPelajaranClient({ subjects: initialSubjects }: MataPelajaranClientProps) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Subject | null>(null)
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({ name: "", urutan: 1, isActive: true })

  const handleAdd = () => {
    setEditItem(null)
    setForm({ name: "", urutan: subjects.length + 1, isActive: true })
    setDialogOpen(true)
  }

  const handleEdit = (item: Subject) => {
    setEditItem(item)
    setForm({ name: item.name, urutan: item.urutan, isActive: item.isActive })
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus mata pelajaran ini?")) return
    startTransition(async () => {
      const result = await deleteSubject(id)
      if (result.error) toast.error(result.error)
      else {
        toast.success("Berhasil dihapus")
        setSubjects(subjects.filter((s) => s.id !== id))
      }
    })
  }

  const handleSubmit = () => {
    if (!form.name?.trim()) { toast.error("Nama wajib diisi"); return }
    if (form.urutan < 1) { toast.error("Urutan minimal 1"); return }
    startTransition(async () => {
      const result = editItem
        ? await updateSubject(editItem.id, {
            name: form.name!,
            urutan: form.urutan,
            isActive: form.isActive,
          })
        : await createSubject({
            name: form.name!,
            urutan: form.urutan,
          })
      if (result.error) toast.error(result.error)
      else {
        toast.success(editItem ? "Berhasil diperbarui" : "Berhasil ditambahkan")
        setDialogOpen(false)
        setSubjects((prev) => {
          if (editItem) {
            return prev.map((s) => (s.id === editItem.id ? { ...s, ...form } : s))
          } else {
            return [...prev, { id: (result as any).id, ...form, createdAt: new Date(), updatedAt: new Date() }]
          }
        })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Tambah
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No</TableHead>
              <TableHead>Nama Mata Pelajaran</TableHead>
              <TableHead className="w-24">Urutan</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-32 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Belum ada data mata pelajaran
                </TableCell>
              </TableRow>
            ) : (
              subjects
                .sort((a, b) => a.urutan - b.urutan)
                .map((subject, i) => (
                  <TableRow key={subject.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.urutan}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${subject.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {subject.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(subject)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(subject.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Nama Mata Pelajaran</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Matematika"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Urutan</Label>
              <Input
                type="number"
                min="1"
                value={form.urutan}
                onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })}
              />
            </div>
            {editItem && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="text-sm">Aktif</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
