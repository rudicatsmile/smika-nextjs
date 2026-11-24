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
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, Edit, Trash2, Loader2, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import { createEducationHistory, updateEducationHistory, deleteEducationHistory } from "@/server/actions/education-history"

interface EducationOption {
  id: string
  name: string
  level: string
}

interface EducationHistoryItem {
  id: string
  educationId: string
  education: { id: string; name: string; level: string }
  institutionName?: string
  major?: string
  graduationYear?: number
  startDate?: string
  endDate?: string
  gpa?: number
  isGraduated: boolean
}

interface EducationHistoryTableProps {
  employeeId: string
  initialData: EducationHistoryItem[]
  educationOptions: EducationOption[]
}

export function EducationHistoryTable({ employeeId, initialData, educationOptions }: EducationHistoryTableProps) {
  const [data, setData] = useState<EducationHistoryItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<EducationHistoryItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    educationId: string
    institutionName: string
    major: string
    graduationYear: string
    startDate: string
    endDate: string
    gpa: string
    isGraduated: boolean
  }>({
    educationId: "",
    institutionName: "",
    major: "",
    graduationYear: "",
    startDate: "",
    endDate: "",
    gpa: "",
    isGraduated: true,
  })
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setData(initialData)
    setMounted(true)
  }, [initialData])

  if (!mounted) return null

  const handleSubmit = async () => {
    if (!form.educationId) {
      toast.error("Education level is required")
      return
    }
    setIsPending(true)
    try {
      if (editItem) {
        const result = await updateEducationHistory(editItem.id, {
          educationId: form.educationId,
          institutionName: form.institutionName || undefined,
          major: form.major || undefined,
          graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          gpa: form.gpa ? parseFloat(form.gpa) : undefined,
          isGraduated: form.isGraduated,
        })
        if (result.success) {
          setData(data.map((item) => (item.id === editItem.id ? { 
            ...item, 
            educationId: form.educationId,
            education: educationOptions.find(e => e.id === form.educationId)!,
            institutionName: form.institutionName || undefined,
            major: form.major || undefined,
            graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            gpa: form.gpa ? parseFloat(form.gpa) : undefined,
            isGraduated: form.isGraduated,
          } : item)))
          toast.success("Education history updated successfully")
          setDialogOpen(false)
          setEditItem(null)
        } else {
          toast.error(result.error || "Failed to update")
        }
      } else {
        const result = await createEducationHistory({
          employeeId,
          educationId: form.educationId,
          institutionName: form.institutionName || undefined,
          major: form.major || undefined,
          graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          gpa: form.gpa ? parseFloat(form.gpa) : undefined,
          isGraduated: form.isGraduated,
        })
        if (result.success) {
          const newItem: EducationHistoryItem = {
            id: result.id,
            educationId: form.educationId,
            education: educationOptions.find(e => e.id === form.educationId)!,
            institutionName: form.institutionName || undefined,
            major: form.major || undefined,
            graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            gpa: form.gpa ? parseFloat(form.gpa) : undefined,
            isGraduated: form.isGraduated,
          }
          setData([...data, newItem])
          toast.success("Education history added successfully")
          setDialogOpen(false)
        } else {
          toast.error(result.error || "Failed to create")
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
      const result = await deleteEducationHistory(deleteId)
      if (result.success) {
        setData(data.filter((item) => item.id !== deleteId))
        toast.success("Education history deleted successfully")
        setDeleteId(null)
      } else {
        toast.error(result.error || "Failed to delete")
      }
    } finally {
      setIsPending(false)
    }
  }

  const openDialog = (item?: EducationHistoryItem) => {
    if (item) {
      setEditItem(item)
      setForm({
        educationId: item.educationId,
        institutionName: item.institutionName || "",
        major: item.major || "",
        graduationYear: item.graduationYear?.toString() || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        gpa: item.gpa?.toString() || "",
        isGraduated: item.isGraduated,
      })
    } else {
      setEditItem(null)
      setForm({
        educationId: "",
        institutionName: "",
        major: "",
        graduationYear: "",
        startDate: "",
        endDate: "",
        gpa: "",
        isGraduated: true,
      })
    }
    setDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <GraduationCap className="h-5 w-5 text-primary" />
            Riwayat Pendidikan Lengkap
          </CardTitle>
          <Button onClick={() => openDialog()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Riwayat
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Belum ada data riwayat pendidikan yang tercatat.
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.id} className="border border-border/70 rounded-xl p-4 hover:bg-muted/40 transition-colors bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base text-foreground">{item.education.name}</span>
                      <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">{item.education.level}</span>
                      {!item.isGraduated && (
                        <span className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium px-2 py-0.5 rounded-full">Sedang Menempuh</span>
                      )}
                    </div>
                    {item.institutionName && (
                      <div className="text-sm font-medium text-foreground/80 mt-1">{item.institutionName}</div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                      {item.major && <div>Jurusan: <span className="font-medium text-foreground">{item.major}</span></div>}
                      {item.graduationYear && <div>Tahun Lulus: <span className="font-medium text-foreground">{item.graduationYear}</span></div>}
                      {item.gpa && <div>IPK: <span className="font-medium text-foreground">{item.gpa}</span></div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openDialog(item)} aria-label="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(item.id)} aria-label="Hapus">
                      <Trash2 className="h-4 w-4" />
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
            <DialogTitle>{editItem ? "Edit Riwayat Pendidikan" : "Tambah Riwayat Pendidikan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="educationId">Jenjang Pendidikan</Label>
              <Select value={form.educationId} onValueChange={(v) => setForm({ ...form, educationId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenjang pendidikan" />
                </SelectTrigger>
                <SelectContent>
                  {educationOptions.map((edu) => (
                    <SelectItem key={edu.id} value={edu.id}>{edu.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="institutionName">Nama Institusi / Kampus / Sekolah</Label>
              <Input
                id="institutionName"
                value={form.institutionName}
                onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                placeholder="Contoh: Universitas Indonesia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="major">Jurusan / Program Studi</Label>
              <Input
                id="major"
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
                placeholder="Contoh: Manajemen Pendidikan"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Tahun Lulus</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={form.graduationYear}
                  onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                  placeholder="2020"
                  min={1950}
                  max={2099}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">IPK</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  value={form.gpa}
                  onChange={(e) => setForm({ ...form, gpa: e.target.value })}
                  placeholder="3.75"
                  min={0}
                  max={4}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Tgl Mulai</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tgl Selesai</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <Switch
                id="isGraduated"
                checked={form.isGraduated}
                onCheckedChange={(checked) => setForm({ ...form, isGraduated: checked })}
              />
              <Label htmlFor="isGraduated">Sudah Lulus</Label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Riwayat Pendidikan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data riwayat pendidikan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
