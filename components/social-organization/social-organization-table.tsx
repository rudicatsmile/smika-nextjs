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
import { Plus, Edit, Trash2, Loader2, Users as UsersIcon, MapPin, Briefcase, Calendar } from "lucide-react"
import { toast } from "sonner"
import { createSocialOrganization, updateSocialOrganization, deleteSocialOrganization } from "@/server/actions/social-organization"

interface SocialOrganizationItem {
  id: string
  employeeId: string
  organizationName?: string
  organizationAddress?: string
  position?: string
  joinDate?: Date | string
}

export function SocialOrganizationTable({ employeeId, initialData }: {
  employeeId: string
  initialData: SocialOrganizationItem[]
}) {
  const [data, setData] = useState<SocialOrganizationItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<SocialOrganizationItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    organizationName: string
    organizationAddress: string
    position: string
    joinDate: string
  }>({
    organizationName: "",
    organizationAddress: "",
    position: "",
    joinDate: "",
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
        const result = await updateSocialOrganization(editItem.id, {
          organizationName: form.organizationName || undefined,
          organizationAddress: form.organizationAddress || undefined,
          position: form.position || undefined,
          joinDate: form.joinDate || undefined,
        })
        if (result.success) {
          setData(data.map((item) => (item.id === editItem.id ? {
            ...item,
            organizationName: form.organizationName || undefined,
            organizationAddress: form.organizationAddress || undefined,
            position: form.position || undefined,
            joinDate: form.joinDate || undefined,
          } : item)))
          toast.success("Data organisasi kemasyarakatan berhasil diperbarui")
          setDialogOpen(false)
          setEditItem(null)
        } else {
          toast.error(result.error || "Gagal memperbarui")
        }
      } else {
        const result = await createSocialOrganization({
          employeeId,
          organizationName: form.organizationName || undefined,
          organizationAddress: form.organizationAddress || undefined,
          position: form.position || undefined,
          joinDate: form.joinDate || undefined,
        })
        if (result.success) {
          const newItem: SocialOrganizationItem = {
            id: result.id,
            employeeId,
            organizationName: form.organizationName || undefined,
            organizationAddress: form.organizationAddress || undefined,
            position: form.position || undefined,
            joinDate: form.joinDate || undefined,
          }
          setData([...data, newItem])
          toast.success("Data organisasi kemasyarakatan berhasil ditambahkan")
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
      const result = await deleteSocialOrganization(deleteId)
      if (result.success) {
        setData(data.filter((item) => item.id !== deleteId))
        toast.success("Data organisasi kemasyarakatan berhasil dihapus")
        setDeleteId(null)
      } else {
        toast.error(result.error || "Gagal menghapus")
      }
    } finally {
      setIsPending(false)
    }
  }

  const openDialog = (item?: SocialOrganizationItem) => {
    if (item) {
      setEditItem(item)
      setForm({
        organizationName: item.organizationName || "",
        organizationAddress: item.organizationAddress || "",
        position: item.position || "",
        joinDate: item.joinDate ? new Date(item.joinDate).toISOString().split('T')[0] : "",
      })
    } else {
      setEditItem(null)
      setForm({
        organizationName: "",
        organizationAddress: "",
        position: "",
        joinDate: "",
      })
    }
    setDialogOpen(true)
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Data Organisasi Kemasyarakatan
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
            Belum ada data organisasi kemasyarakatan
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {item.organizationName && (
                      <div className="flex items-center gap-2 text-sm">
                        <UsersIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Nama Organisasi:</span>
                        <span className="font-medium">{item.organizationName}</span>
                      </div>
                    )}
                    {item.organizationAddress && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">Alamat:</span>
                        <span className="flex-1">{item.organizationAddress}</span>
                      </div>
                    )}
                    {item.position && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Jabatan:</span>
                        <span>{item.position}</span>
                      </div>
                    )}
                    {item.joinDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Tanggal Bergabung:</span>
                        <span>{formatDate(item.joinDate)}</span>
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
            <DialogTitle>{editItem ? "Edit Data Organisasi Kemasyarakatan" : "Tambah Data Organisasi Kemasyarakatan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Nama Organisasi</Label>
              <Input
                id="organizationName"
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                placeholder="Nama organisasi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationAddress">Alamat Organisasi</Label>
              <Input
                id="organizationAddress"
                value={form.organizationAddress}
                onChange={(e) => setForm({ ...form, organizationAddress: e.target.value })}
                placeholder="Alamat organisasi"
              />
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
              <Label htmlFor="joinDate">Tanggal Bergabung</Label>
              <Input
                id="joinDate"
                type="date"
                value={form.joinDate}
                onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
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
            <AlertDialogTitle>Hapus Data Organisasi Kemasyarakatan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data organisasi kemasyarakatan ini? Tindakan ini tidak dapat dibatalkan.
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
