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
import {
  RadioGroup, RadioGroupItem,
} from "@/components/ui/radio-group"
import { Plus, Edit, Trash2, Loader2, FileText, MapPin, Building2, Briefcase } from "lucide-react"
import { toast } from "sonner"
import { createWorkUnit, updateWorkUnit, deleteWorkUnit } from "@/server/actions/work-unit"
import { Badge } from "@/components/ui/badge"

interface WorkUnitItem {
  id: string
  employeeId: string
  worksElsewhere: boolean
  workplaceName?: string
  status?: string
  position?: string
  positionFunction?: string
  workplaceAddress?: string
}

export function WorkUnitTable({ employeeId, initialData }: {
  employeeId: string
  initialData: WorkUnitItem[]
}) {
  const [data, setData] = useState<WorkUnitItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<WorkUnitItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    worksElsewhere: string
    workplaceName: string
    status: string
    position: string
    positionFunction: string
    workplaceAddress: string
  }>({
    worksElsewhere: "false",
    workplaceName: "",
    status: "",
    position: "",
    positionFunction: "",
    workplaceAddress: "",
  })
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setData(initialData)
    setMounted(true)
  }, [initialData])

  if (!mounted) return null

  const handleSubmit = async () => {
    setIsPending(true)
    try {
      if (editItem) {
        const result = await updateWorkUnit(editItem.id, {
          worksElsewhere: form.worksElsewhere === "true",
          workplaceName: form.workplaceName || undefined,
          status: form.status || undefined,
          position: form.position || undefined,
          positionFunction: form.positionFunction || undefined,
          workplaceAddress: form.workplaceAddress || undefined,
        })
        if (result.success) {
          setData(data.map((item) => (item.id === editItem.id ? {
            ...item,
            worksElsewhere: form.worksElsewhere === "true",
            workplaceName: form.workplaceName || undefined,
            status: form.status || undefined,
            position: form.position || undefined,
            positionFunction: form.positionFunction || undefined,
            workplaceAddress: form.workplaceAddress || undefined,
          } : item)))
          toast.success("Data unit kerja berhasil diperbarui")
          setDialogOpen(false)
          setEditItem(null)
        } else {
          toast.error(result.error || "Gagal memperbarui")
        }
      } else {
        const result = await createWorkUnit({
          employeeId,
          worksElsewhere: form.worksElsewhere === "true",
          workplaceName: form.workplaceName || undefined,
          status: form.status || undefined,
          position: form.position || undefined,
          positionFunction: form.positionFunction || undefined,
          workplaceAddress: form.workplaceAddress || undefined,
        })
        if (result.success) {
          const newItem: WorkUnitItem = {
            id: result.id,
            employeeId,
            worksElsewhere: form.worksElsewhere === "true",
            workplaceName: form.workplaceName || undefined,
            status: form.status || undefined,
            position: form.position || undefined,
            positionFunction: form.positionFunction || undefined,
            workplaceAddress: form.workplaceAddress || undefined,
          }
          setData([...data, newItem])
          toast.success("Data unit kerja berhasil ditambahkan")
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
      const result = await deleteWorkUnit(deleteId)
      if (result.success) {
        setData(data.filter((item) => item.id !== deleteId))
        toast.success("Data unit kerja berhasil dihapus")
        setDeleteId(null)
      } else {
        toast.error(result.error || "Gagal menghapus")
      }
    } finally {
      setIsPending(false)
    }
  }

  const openDialog = (item?: WorkUnitItem) => {
    if (item) {
      setEditItem(item)
      setForm({
        worksElsewhere: item.worksElsewhere ? "true" : "false",
        workplaceName: item.workplaceName || "",
        status: item.status || "",
        position: item.position || "",
        positionFunction: item.positionFunction || "",
        workplaceAddress: item.workplaceAddress || "",
      })
    } else {
      setEditItem(null)
      setForm({
        worksElsewhere: "false",
        workplaceName: "",
        status: "",
        position: "",
        positionFunction: "",
        workplaceAddress: "",
      })
    }
    setDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Unit Kerja Lain
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
            Belum ada data unit kerja lain
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-lg">
                        {item.worksElsewhere ? "Bekerja/Mengajar Di Tempat Lain" : "Tidak Bekerja Di Tempat Lain"}
                      </span>
                      <Badge variant={item.worksElsewhere ? "default" : "secondary"}>
                        {item.worksElsewhere ? "Ya" : "Tidak"}
                      </Badge>
                    </div>
                    {item.workplaceName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Tempat:</span>
                        <span>{item.workplaceName}</span>
                      </div>
                    )}
                    {item.status && (
                      <div className="text-sm text-muted-foreground">
                        Status: {item.status}
                      </div>
                    )}
                    {item.position && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Jabatan:</span>
                        <span>{item.position}</span>
                      </div>
                    )}
                    {item.positionFunction && (
                      <div className="text-sm text-muted-foreground">
                        Fungsi Jabatan: {item.positionFunction}
                      </div>
                    )}
                    {item.workplaceAddress && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">Alamat:</span>
                        <span className="flex-1">{item.workplaceAddress}</span>
                      </div>
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
            <DialogTitle>{editItem ? "Edit Data Unit Kerja Lain" : "Tambah Data Unit Kerja Lain"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Bekerja / Mengajar Di Tempat Lain</Label>
              <RadioGroup value={form.worksElsewhere} onValueChange={(v) => setForm({ ...form, worksElsewhere: v })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="yes" />
                  <Label htmlFor="yes">Ya</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="no" />
                  <Label htmlFor="no">Tidak</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workplaceName">Tempat Bekerja / Mengajar</Label>
              <Input
                id="workplaceName"
                value={form.workplaceName}
                onChange={(e) => setForm({ ...form, workplaceName: e.target.value })}
                placeholder="Nama tempat kerja/mengajar"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Tetap" id="tetap" />
                  <Label htmlFor="tetap">Tetap</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Tidak Tetap" id="tidak-tetap" />
                  <Label htmlFor="tidak-tetap">Tidak Tetap</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ASN" id="asn" />
                  <Label htmlFor="asn">ASN</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Jabatan</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="Jabatan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="positionFunction">Fungsi Jabatan</Label>
              <Input
                id="positionFunction"
                value={form.positionFunction}
                onChange={(e) => setForm({ ...form, positionFunction: e.target.value })}
                placeholder="Fungsi jabatan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workplaceAddress">Alamat Tempat Bekerja / Mengajar</Label>
              <Textarea
                id="workplaceAddress"
                value={form.workplaceAddress}
                onChange={(e) => setForm({ ...form, workplaceAddress: e.target.value })}
                placeholder="Alamat lengkap tempat kerja/mengajar"
                rows={3}
              />
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
            <AlertDialogTitle>Hapus Data Unit Kerja Lain</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data unit kerja lain ini? Tindakan ini tidak dapat dibatalkan.
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
