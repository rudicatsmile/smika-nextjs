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
  RadioGroup, RadioGroupItem,
} from "@/components/ui/radio-group"
import { Plus, Edit, Trash2, Loader2, FileText, Download, Award, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import { createCertification, updateCertification, deleteCertification } from "@/server/actions/certification"
import { Badge } from "@/components/ui/badge"

interface CertificationItem {
  id: string
  employeeId: string
  isCertifiedTeacher: boolean
  certificationBaseSchool?: string
  educationCertificateNumber?: string
  certificationYear?: number
  inpassingBaseSchool?: string
  inpassingSkNumber?: string
  inpassingSkYear?: number
  file?: string
}

export function CertificationTable({ employeeId, initialData }: {
  employeeId: string
  initialData: CertificationItem[]
}) {
  const [data, setData] = useState<CertificationItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<CertificationItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    isCertifiedTeacher: string
    certificationBaseSchool: string
    educationCertificateNumber: string
    certificationYear: string
    inpassingBaseSchool: string
    inpassingSkNumber: string
    inpassingSkYear: string
    file: string
  }>({
    isCertifiedTeacher: "false",
    certificationBaseSchool: "",
    educationCertificateNumber: "",
    certificationYear: "",
    inpassingBaseSchool: "",
    inpassingSkNumber: "",
    inpassingSkYear: "",
    file: "",
  })
  const [isPending, setIsPending] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  useEffect(() => {
    setData(initialData)
    setMounted(true)
  }, [initialData])

  if (!mounted) return null

  const handleSubmit = async () => {
    setIsPending(true)
    try {
      if (editItem) {
        const result = await updateCertification(editItem.id, {
          isCertifiedTeacher: form.isCertifiedTeacher === "true",
          certificationBaseSchool: form.certificationBaseSchool || undefined,
          educationCertificateNumber: form.educationCertificateNumber || undefined,
          certificationYear: form.certificationYear ? parseInt(form.certificationYear) : undefined,
          inpassingBaseSchool: form.inpassingBaseSchool || undefined,
          inpassingSkNumber: form.inpassingSkNumber || undefined,
          inpassingSkYear: form.inpassingSkYear ? parseInt(form.inpassingSkYear) : undefined,
          file: form.file || undefined,
        })
        if (result.success) {
          setData(data.map((item) => (item.id === editItem.id ? {
            ...item,
            isCertifiedTeacher: form.isCertifiedTeacher === "true",
            certificationBaseSchool: form.certificationBaseSchool || undefined,
            educationCertificateNumber: form.educationCertificateNumber || undefined,
            certificationYear: form.certificationYear ? parseInt(form.certificationYear) : undefined,
            inpassingBaseSchool: form.inpassingBaseSchool || undefined,
            inpassingSkNumber: form.inpassingSkNumber || undefined,
            inpassingSkYear: form.inpassingSkYear ? parseInt(form.inpassingSkYear) : undefined,
            file: form.file || undefined,
          } : item)))
          toast.success("Data sertifikasi berhasil diperbarui")
          setDialogOpen(false)
          setEditItem(null)
        } else {
          toast.error(result.error || "Gagal memperbarui")
        }
      } else {
        const result = await createCertification({
          employeeId,
          isCertifiedTeacher: form.isCertifiedTeacher === "true",
          certificationBaseSchool: form.certificationBaseSchool || undefined,
          educationCertificateNumber: form.educationCertificateNumber || undefined,
          certificationYear: form.certificationYear ? parseInt(form.certificationYear) : undefined,
          inpassingBaseSchool: form.inpassingBaseSchool || undefined,
          inpassingSkNumber: form.inpassingSkNumber || undefined,
          inpassingSkYear: form.inpassingSkYear ? parseInt(form.inpassingSkYear) : undefined,
          file: form.file || undefined,
        })
        if (result.success) {
          const newItem: CertificationItem = {
            id: result.id,
            employeeId,
            isCertifiedTeacher: form.isCertifiedTeacher === "true",
            certificationBaseSchool: form.certificationBaseSchool || undefined,
            educationCertificateNumber: form.educationCertificateNumber || undefined,
            certificationYear: form.certificationYear ? parseInt(form.certificationYear) : undefined,
            inpassingBaseSchool: form.inpassingBaseSchool || undefined,
            inpassingSkNumber: form.inpassingSkNumber || undefined,
            inpassingSkYear: form.inpassingSkYear ? parseInt(form.inpassingSkYear) : undefined,
            file: form.file || undefined,
          }
          setData([...data, newItem])
          toast.success("Data sertifikasi berhasil ditambahkan")
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
      const result = await deleteCertification(deleteId)
      if (result.success) {
        setData(data.filter((item) => item.id !== deleteId))
        toast.success("Data sertifikasi berhasil dihapus")
        setDeleteId(null)
      } else {
        toast.error(result.error || "Gagal menghapus")
      }
    } finally {
      setIsPending(false)
    }
  }

  const openDialog = (item?: CertificationItem) => {
    if (item) {
      setEditItem(item)
      setForm({
        isCertifiedTeacher: item.isCertifiedTeacher ? "true" : "false",
        certificationBaseSchool: item.certificationBaseSchool || "",
        educationCertificateNumber: item.educationCertificateNumber || "",
        certificationYear: item.certificationYear?.toString() || "",
        inpassingBaseSchool: item.inpassingBaseSchool || "",
        inpassingSkNumber: item.inpassingSkNumber || "",
        inpassingSkYear: item.inpassingSkYear?.toString() || "",
        file: item.file || "",
      })
      setFilePreview(item.file || null)
    } else {
      setEditItem(null)
      setForm({
        isCertifiedTeacher: "false",
        certificationBaseSchool: "",
        educationCertificateNumber: "",
        certificationYear: "",
        inpassingBaseSchool: "",
        inpassingSkNumber: "",
        inpassingSkYear: "",
        file: "",
      })
      setFilePreview(null)
    }
    setDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFilePreview(base64)
        setForm({ ...form, file: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Sertifikasi
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
            Belum ada data sertifikasi
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-lg">
                        {item.isCertifiedTeacher ? "Guru Bersertifikasi" : "Guru Tidak Bersertifikasi"}
                      </span>
                      <Badge variant={item.isCertifiedTeacher ? "default" : "secondary"}>
                        {item.isCertifiedTeacher ? "Ya" : "Tidak"}
                      </Badge>
                    </div>
                    {item.certificationBaseSchool && (
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Sekolah Induk Sertifikasi:</span>
                        <span>{item.certificationBaseSchool}</span>
                      </div>
                    )}
                    {item.educationCertificateNumber && (
                      <div className="text-sm text-muted-foreground">
                        No. Sertifikat Pendidikan: {item.educationCertificateNumber}
                      </div>
                    )}
                    {item.certificationYear && (
                      <div className="text-sm text-muted-foreground">
                        Tahun Sertifikasi: {item.certificationYear}
                      </div>
                    )}
                    {(item.inpassingBaseSchool || item.inpassingSkNumber || item.inpassingSkYear) && (
                      <div className="border-t pt-2 mt-2 space-y-1">
                        <div className="text-sm font-medium">Data Inpassing:</div>
                        {item.inpassingBaseSchool && (
                          <div className="text-sm text-muted-foreground">
                            Sekolah Induk Inpassing: {item.inpassingBaseSchool}
                          </div>
                        )}
                        {item.inpassingSkNumber && (
                          <div className="text-sm text-muted-foreground">
                            No. SK Inpassing: {item.inpassingSkNumber}
                          </div>
                        )}
                        {item.inpassingSkYear && (
                          <div className="text-sm text-muted-foreground">
                            Tahun SK Inpassing: {item.inpassingSkYear}
                          </div>
                        )}
                      </div>
                    )}
                    {item.file && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = item.file!
                          link.download = `sertifikasi-${item.id}.pdf`
                          link.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </Button>
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
            <DialogTitle>{editItem ? "Edit Data Sertifikasi" : "Tambah Data Sertifikasi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Guru Bersertifikasi</Label>
              <RadioGroup value={form.isCertifiedTeacher} onValueChange={(v) => setForm({ ...form, isCertifiedTeacher: v })}>
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
              <Label htmlFor="certificationBaseSchool">Sekolah Induk Sertifikasi</Label>
              <Input
                id="certificationBaseSchool"
                value={form.certificationBaseSchool}
                onChange={(e) => setForm({ ...form, certificationBaseSchool: e.target.value })}
                placeholder="Nama sekolah induk sertifikasi"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="educationCertificateNumber">Nomor Sertifikat Pendidikan</Label>
                <Input
                  id="educationCertificateNumber"
                  value={form.educationCertificateNumber}
                  onChange={(e) => setForm({ ...form, educationCertificateNumber: e.target.value })}
                  placeholder="123/SRT/2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificationYear">Tahun Sertifikasi</Label>
                <Input
                  id="certificationYear"
                  type="number"
                  value={form.certificationYear}
                  onChange={(e) => setForm({ ...form, certificationYear: e.target.value })}
                  placeholder="2024"
                />
              </div>
            </div>
            <div className="border-t pt-4 space-y-4">
              <div className="text-sm font-medium">Data Inpassing</div>
              <div className="space-y-2">
                <Label htmlFor="inpassingBaseSchool">Sekolah Induk Inpassing</Label>
                <Input
                  id="inpassingBaseSchool"
                  value={form.inpassingBaseSchool}
                  onChange={(e) => setForm({ ...form, inpassingBaseSchool: e.target.value })}
                  placeholder="Nama sekolah induk inpassing"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inpassingSkNumber">Nomor SK Inpassing</Label>
                  <Input
                    id="inpassingSkNumber"
                    value={form.inpassingSkNumber}
                    onChange={(e) => setForm({ ...form, inpassingSkNumber: e.target.value })}
                    placeholder="123/SK/2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inpassingSkYear">Tahun SK Inpassing</Label>
                  <Input
                    id="inpassingSkYear"
                    type="number"
                    value={form.inpassingSkYear}
                    onChange={(e) => setForm({ ...form, inpassingSkYear: e.target.value })}
                    placeholder="2024"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              {filePreview && (
                <div className="flex items-center gap-2 mt-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">File terpilih</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilePreview(null)
                      setForm({ ...form, file: "" })
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              )}
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
            <AlertDialogTitle>Hapus Data Sertifikasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data sertifikasi ini? Tindakan ini tidak dapat dibatalkan.
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
