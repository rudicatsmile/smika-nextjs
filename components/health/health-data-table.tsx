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
import { Plus, Edit, Trash2, Loader2, Heart, Building2, User } from "lucide-react"
import { toast } from "sonner"
import { createHealthData, updateHealthData, deleteHealthData } from "@/server/actions/health-data"

interface HealthDataItem {
  id: string
  employeeId: string
  healthcareProviderName?: string
  level1HealthFacility?: string
  bpjsNumber?: string
}

export function HealthDataTable({ employeeId, initialData }: {
  employeeId: string
  initialData: HealthDataItem[]
}) {
  const [data, setData] = useState<HealthDataItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<HealthDataItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    healthcareProviderName: string
    level1HealthFacility: string
    bpjsNumber: string
  }>({
    healthcareProviderName: "",
    level1HealthFacility: "",
    bpjsNumber: "",
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
        const result = await updateHealthData(editItem.id, {
          healthcareProviderName: form.healthcareProviderName || undefined,
          level1HealthFacility: form.level1HealthFacility || undefined,
          bpjsNumber: form.bpjsNumber || undefined,
        })
        if (result.success) {
          setData(data.map((item) => (item.id === editItem.id ? {
            ...item,
            healthcareProviderName: form.healthcareProviderName || undefined,
            level1HealthFacility: form.level1HealthFacility || undefined,
            bpjsNumber: form.bpjsNumber || undefined,
          } : item)))
          toast.success("Data kesehatan berhasil diperbarui")
          setDialogOpen(false)
          setEditItem(null)
        } else {
          toast.error(result.error || "Gagal memperbarui")
        }
      } else {
        const result = await createHealthData({
          employeeId,
          healthcareProviderName: form.healthcareProviderName || undefined,
          level1HealthFacility: form.level1HealthFacility || undefined,
          bpjsNumber: form.bpjsNumber || undefined,
        })
        if (result.success) {
          const newItem: HealthDataItem = {
            id: result.id,
            employeeId,
            healthcareProviderName: form.healthcareProviderName || undefined,
            level1HealthFacility: form.level1HealthFacility || undefined,
            bpjsNumber: form.bpjsNumber || undefined,
          }
          setData([...data, newItem])
          toast.success("Data kesehatan berhasil ditambahkan")
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
      const result = await deleteHealthData(deleteId)
      if (result.success) {
        setData(data.filter((item) => item.id !== deleteId))
        toast.success("Data kesehatan berhasil dihapus")
        setDeleteId(null)
      } else {
        toast.error(result.error || "Gagal menghapus")
      }
    } finally {
      setIsPending(false)
    }
  }

  const openDialog = (item?: HealthDataItem) => {
    if (item) {
      setEditItem(item)
      setForm({
        healthcareProviderName: item.healthcareProviderName || "",
        level1HealthFacility: item.level1HealthFacility || "",
        bpjsNumber: item.bpjsNumber || "",
      })
    } else {
      setEditItem(null)
      setForm({
        healthcareProviderName: "",
        level1HealthFacility: "",
        bpjsNumber: "",
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
            Data Kesehatan
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
            Belum ada data kesehatan
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {item.healthcareProviderName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Nama Tempat Penyelenggara:</span>
                        <span className="font-medium">{item.healthcareProviderName}</span>
                      </div>
                    )}
                    {item.level1HealthFacility && (
                      <div className="text-sm text-muted-foreground">
                        Fasilitas Kesehatan Tingkat 1: {item.level1HealthFacility}
                      </div>
                    )}
                    {item.bpjsNumber && (
                      <div className="text-sm text-muted-foreground">
                        Nomor BPJS: {item.bpjsNumber}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Data Kesehatan" : "Tambah Data Kesehatan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="healthcareProviderName">Nama Tempat Penyelenggara</Label>
              <Input
                id="healthcareProviderName"
                value={form.healthcareProviderName}
                onChange={(e) => setForm({ ...form, healthcareProviderName: e.target.value })}
                placeholder="Nama tempat penyelenggara"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level1HealthFacility">Fasilitas Kesehatan Tingkat 1</Label>
              <Input
                id="level1HealthFacility"
                value={form.level1HealthFacility}
                onChange={(e) => setForm({ ...form, level1HealthFacility: e.target.value })}
                placeholder="Fasilitas kesehatan tingkat 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bpjsNumber">Nomor BPJS</Label>
              <Input
                id="bpjsNumber"
                value={form.bpjsNumber}
                onChange={(e) => setForm({ ...form, bpjsNumber: e.target.value })}
                placeholder="Nomor BPJS"
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
            <AlertDialogTitle>Hapus Data Kesehatan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data kesehatan ini? Tindakan ini tidak dapat dibatalkan.
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
