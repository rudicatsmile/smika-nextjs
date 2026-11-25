"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Role } from "@/app/generated/prisma/enums"

interface SocialOrganizationItem {
  id: string
  employeeId: string
  organizationName?: string | null
  organizationAddress?: string | null
  position?: string | null
  joinDate?: Date | string | null
}

function cleanDisplayText(value?: string | null): string {
  if (!value) return ""
  return value.replace(/\\'/g, "'").replace(/\\"/g, '"').trim()
}

export function SocialOrganizationTable({ employeeId, initialData }: {
  employeeId: string
  initialData: SocialOrganizationItem[]
}) {
  const { data: session } = useSession()
  const role = session?.user?.role as Role | undefined
  const sessionEmployeeId = session?.user?.employeeId
  const canMutate =
    role === "SUPER_ADMIN" ||
    role === "HR" ||
    (role === "PEGAWAI" && sessionEmployeeId === employeeId)

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
    if (!form.organizationName.trim()) {
      toast.error("Nama organisasi wajib diisi")
      return
    }

    setIsPending(true)
    try {
      if (editItem) {
        const result = await updateSocialOrganization(editItem.id, {
          organizationName: form.organizationName.trim() || undefined,
          organizationAddress: form.organizationAddress.trim() || undefined,
          position: form.position.trim() || undefined,
          joinDate: form.joinDate || undefined,
        })
        if (result.success) {
          setData(data.map((item) => (item.id === editItem.id ? {
            ...item,
            organizationName: form.organizationName.trim() || undefined,
            organizationAddress: form.organizationAddress.trim() || undefined,
            position: form.position.trim() || undefined,
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
          organizationName: form.organizationName.trim() || undefined,
          organizationAddress: form.organizationAddress.trim() || undefined,
          position: form.position.trim() || undefined,
          joinDate: form.joinDate || undefined,
        })
        if (result.success && result.id) {
          const newItem: SocialOrganizationItem = {
            id: result.id,
            employeeId,
            organizationName: form.organizationName.trim() || undefined,
            organizationAddress: form.organizationAddress.trim() || undefined,
            position: form.position.trim() || undefined,
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
        organizationName: cleanDisplayText(item.organizationName),
        organizationAddress: cleanDisplayText(item.organizationAddress),
        position: cleanDisplayText(item.position),
        joinDate: item.joinDate ? new Date(item.joinDate).toISOString().split("T")[0] : "",
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

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null
    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) return null
    return parsed.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  }

  return (
    <Card className="border border-border/70 shadow-xs overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <UsersIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold leading-tight text-foreground">
                Data Organisasi Kemasyarakatan
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Riwayat keaktifan dalam organisasi masyarakat, profesi, atau komunitas
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1 sm:pt-0">
            <Badge variant="secondary" className="text-xs font-medium px-2.5 py-1">
              {data.length} Organisasi
            </Badge>
            {canMutate && (
              <Button onClick={() => openDialog()} size="sm" className="gap-1.5 rounded-xl h-9">
                <Plus className="h-4 w-4" />
                <span>Tambah</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {data.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-border/80 bg-muted/20">
            <div className="mx-auto w-11 h-11 rounded-full bg-muted flex items-center justify-center mb-3">
              <UsersIcon className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-foreground">Belum ada data organisasi kemasyarakatan</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Catatan peran aktif pegawai pada organisasi masyarakat atau lembaga eksternal akan tampil di sini.
            </p>
            {canMutate && (
              <Button onClick={() => openDialog()} variant="outline" size="sm" className="mt-4 gap-1.5 rounded-xl">
                <Plus className="h-4 w-4" />
                <span>Tambah Organisasi</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {data.map((item) => {
              const orgName = cleanDisplayText(item.organizationName)
              const orgAddress = cleanDisplayText(item.organizationAddress)
              const position = cleanDisplayText(item.position)
              const formattedDate = formatDate(item.joinDate)

              return (
                <div
                  key={item.id}
                  className="group rounded-xl border border-border/70 bg-card p-4 sm:p-5 hover:border-primary/30 hover:shadow-xs transition-all"
                >
                  {/* Baris Atas: Nama Organisasi, Jabatan, dan Tombol Aksi */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="hidden sm:flex p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                        <UsersIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <h4 className="text-sm sm:text-base font-semibold text-foreground leading-snug break-words">
                          {orgName || "Nama organisasi belum diisi"}
                        </h4>
                        {position && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge
                              variant="secondary"
                              className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/15 px-2.5 py-0.5 max-w-full"
                            >
                              <Briefcase className="h-3 w-3 shrink-0" />
                              <span className="truncate">{position}</span>
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {canMutate && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          onClick={() => openDialog(item)}
                          aria-label="Edit data organisasi"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(item.id)}
                          aria-label="Hapus data organisasi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Baris Metadata Bawah: Grid 2 kolom di desktop, stack vertikal lega di HP */}
                  <div className="mt-3.5 pt-3.5 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                        <span>Tanggal Bergabung</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        {formattedDate ?? <span className="text-muted-foreground/70 font-normal italic">Belum diisi</span>}
                      </p>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                        <span>Alamat Organisasi</span>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed break-words">
                        {orgAddress || <span className="text-muted-foreground/70 italic">Belum diisi</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!isPending) setDialogOpen(o) }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Data Organisasi Kemasyarakatan" : "Tambah Data Organisasi Kemasyarakatan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="organizationName">
                Nama Organisasi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="organizationName"
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                placeholder="Contoh: Karang Taruna / NU / PGRI"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="position">Jabatan</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="Contoh: Ketua / Sekretaris / Anggota"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="joinDate">Tanggal Bergabung</Label>
              <Input
                id="joinDate"
                type="date"
                value={form.joinDate}
                onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="organizationAddress">Alamat Organisasi</Label>
              <Input
                id="organizationAddress"
                value={form.organizationAddress}
                onChange={(e) => setForm({ ...form, organizationAddress: e.target.value })}
                placeholder="Alamat sekretariat atau wilayah organisasi"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && !isPending && setDeleteId(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Organisasi Kemasyarakatan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data organisasi kemasyarakatan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
