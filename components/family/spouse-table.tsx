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
import { Plus, Edit, Trash2, Loader2, Heart, Calendar, MapPin } from "lucide-react"
import { toast } from "sonner"
import { createSpouse, updateSpouse, deleteSpouse } from "@/server/actions/spouse"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface EducationOption {
  id: string
  name: string
  level: string
}

interface OccupationOption {
  id: string
  name: string
}

interface SpouseItem {
  id: string
  employeeId: string
  name: string
  placeOfBirth?: string
  dateOfBirth?: string
  gender?: string
  relationship?: string
  educationId?: string
  education?: { id: string; name: string; level: string }
  occupationId?: string
  occupation?: { id: string; name: string }
}

const GENDER_LABELS: Record<string, string> = {
  LAKI_LAKI: "Laki-laki",
  PEREMPUAN: "Perempuan",
}

export function SpouseTable({ employeeId, initialData, educationOptions, occupationOptions }: {
  employeeId: string
  initialData: SpouseItem[]
  educationOptions: EducationOption[]
  occupationOptions: OccupationOption[]
}) {
  const [data, setData] = useState<SpouseItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<SpouseItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    name: string
    placeOfBirth: string
    dateOfBirth: string
    gender: string
    relationship: string
    educationId: string
    occupationId: string
  }>({
    name: "",
    placeOfBirth: "",
    dateOfBirth: "",
    gender: "",
    relationship: "",
    educationId: "",
    occupationId: "",
  })
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setData(initialData)
    setMounted(true)
  }, [initialData])

  if (!mounted) return null

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Nama pasangan wajib diisi")
      return
    }
    setIsPending(true)
    try {
      if (editItem) {
        const result = await updateSpouse(editItem.id, {
          name: form.name,
          placeOfBirth: form.placeOfBirth || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender || undefined,
          relationship: form.relationship || undefined,
          educationId: form.educationId || undefined,
          occupationId: form.occupationId || undefined,
        })
        if (result.success) {
          setData(data.map((item) => (item.id === editItem.id ? {
            ...item,
            name: form.name,
            placeOfBirth: form.placeOfBirth || undefined,
            dateOfBirth: form.dateOfBirth || undefined,
            gender: form.gender || undefined,
            relationship: form.relationship || undefined,
            educationId: form.educationId || undefined,
            education: form.educationId ? educationOptions.find(e => e.id === form.educationId)! : undefined,
            occupationId: form.occupationId || undefined,
            occupation: form.occupationId ? occupationOptions.find(o => o.id === form.occupationId)! : undefined,
          } : item)))
          toast.success("Data pasangan berhasil diperbarui")
          setDialogOpen(false)
          setEditItem(null)
        } else {
          toast.error(result.error || "Gagal memperbarui")
        }
      } else {
        const result = await createSpouse({
          employeeId,
          name: form.name,
          placeOfBirth: form.placeOfBirth || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender || undefined,
          relationship: form.relationship || undefined,
          educationId: form.educationId || undefined,
          occupationId: form.occupationId || undefined,
        })
        if (result.success) {
          const newItem: SpouseItem = {
            id: result.id,
            employeeId,
            name: form.name,
            placeOfBirth: form.placeOfBirth || undefined,
            dateOfBirth: form.dateOfBirth || undefined,
            gender: form.gender || undefined,
            relationship: form.relationship || undefined,
            educationId: form.educationId || undefined,
            education: form.educationId ? educationOptions.find(e => e.id === form.educationId)! : undefined,
            occupationId: form.occupationId || undefined,
            occupation: form.occupationId ? occupationOptions.find(o => o.id === form.occupationId)! : undefined,
          }
          setData([...data, newItem])
          toast.success("Data pasangan berhasil ditambahkan")
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
      const result = await deleteSpouse(deleteId)
      if (result.success) {
        setData(data.filter((item) => item.id !== deleteId))
        toast.success("Data pasangan berhasil dihapus")
        setDeleteId(null)
      } else {
        toast.error(result.error || "Gagal menghapus")
      }
    } finally {
      setIsPending(false)
    }
  }

  const openDialog = (item?: SpouseItem) => {
    if (item) {
      setEditItem(item)
      setForm({
        name: item.name,
        placeOfBirth: item.placeOfBirth || "",
        dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth).toISOString().split('T')[0] : "",
        gender: item.gender || "",
        relationship: item.relationship || "",
        educationId: item.educationId || "",
        occupationId: item.occupationId || "",
      })
    } else {
      setEditItem(null)
      setForm({
        name: "",
        placeOfBirth: "",
        dateOfBirth: "",
        gender: "",
        relationship: "",
        educationId: "",
        occupationId: "",
      })
    }
    setDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Data Pasangan
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
            Belum ada data pasangan
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-lg">{item.name}</span>
                      {item.gender && (
                        <span className="text-sm text-muted-foreground">({GENDER_LABELS[item.gender] || item.gender})</span>
                      )}
                      {item.relationship && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">{item.relationship}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {item.placeOfBirth && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{item.placeOfBirth}</span>
                        </div>
                      )}
                      {item.dateOfBirth && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(new Date(item.dateOfBirth), "d MMMM yyyy", { locale: id })}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {item.education && <div className="text-muted-foreground">Pendidikan: {item.education.name}</div>}
                      {item.occupation && <div className="text-muted-foreground">Pekerjaan: {item.occupation.name}</div>}
                    </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Data Pasangan" : "Tambah Data Pasangan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Pasangan</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama lengkap pasangan"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placeOfBirth">Tempat Lahir</Label>
                <Input
                  id="placeOfBirth"
                  value={form.placeOfBirth}
                  onChange={(e) => setForm({ ...form, placeOfBirth: e.target.value })}
                  placeholder="Jakarta"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                    <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Hubungan</Label>
                <Input
                  id="relationship"
                  value={form.relationship}
                  onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                  placeholder="Suami, Istri, dll."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="educationId">Pendidikan</Label>
                <Select value={form.educationId} onValueChange={(v) => setForm({ ...form, educationId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pendidikan" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationOptions.map((edu) => (
                      <SelectItem key={edu.id} value={edu.id}>{edu.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupationId">Pekerjaan</Label>
                <Select value={form.occupationId} onValueChange={(v) => setForm({ ...form, occupationId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pekerjaan" />
                  </SelectTrigger>
                  <SelectContent>
                    {occupationOptions.map((occ) => (
                      <SelectItem key={occ.id} value={occ.id}>{occ.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <AlertDialogTitle>Hapus Data Pasangan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pasangan ini? Tindakan ini tidak dapat dibatalkan.
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
