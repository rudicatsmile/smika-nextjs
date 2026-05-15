"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  RadioGroup, RadioGroupItem,
} from "@/components/ui/radio-group"
import { Loader2, FileText, Calendar } from "lucide-react"
import { toast } from "sonner"
import { createKesediaan, updateKesediaan } from "@/server/actions/kesediaan"

interface Employee {
  id: string
  fullName: string
  employeeIdNumber: string
  kesediaan?: Array<{
    id: string
    tanggal: Date
    isBersedia: boolean
    alasanKesanggupan: string | null
    kesediaanHariKerja: string | null
    photo: string | null
  }>
}

interface KesediaanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
  onSuccess: () => void
}

const KETERANGAN_KESEDIAAN = `KESEDIAAN
Mematuhi peraturan, tata tertib, pedoman, dan kebijakan yang berlaku di Yayasan
Komitmen untuk mendukung visi dan misi Yayasan dan Lembaga
Menduduki jabatan dan melaksanakan tugas fungsinya yang diberikan kepada saya
Melaksanakan tugas dengan jujur, bertanggungjawab dan berintegritas
Melaksanakan tugas tambahan disamping tugas utama yang diamanahkan kepada saya
Mengikuti kegiatan rapat-rapat, kegiatan Keagamaan dan Sosial Kemasyarakatan yang dilaksanakan oleh Yayasan dan atau Lembaga
Mengembangkan kompetensi dan profesionalisme sebagai pendidik/tenaga kependidikan
Menjunjung tinggi etika profesi pendidik dan tenaga kependidikan
Berkomitmen melaksanakan tugas sampai akhir tahun pelajaran
Dengan ini saya menyatakan dengan sesungguhnya bahwa saya sanggup dan bersedia menjalankan tugas dan tanggung jawab sebagai Pendidik/Tenaga Kependidikan di Yayasan Al Wathoniyah Asshokdriyah 9 pada tahun pelajaran (Tahun Pelajaran Berikutnya), dengan penuh tanggung jawab dan mematuhi peraturan yang berlaku`

export function KesediaanFormDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: KesediaanFormDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const [form, setForm] = useState<{
    tanggal: string
    isBersedia: string
    alasanKesanggupan: string
    kesediaanHariKerja: string
    photo: string
  }>({
    tanggal: new Date().toISOString().split('T')[0],
    isBersedia: "true",
    alasanKesanggupan: "",
    kesediaanHariKerja: "",
    photo: "",
  })
  const [filePreview, setFilePreview] = useState<string | null>(null)

  useEffect(() => {
    if (employee && employee.kesediaan && employee.kesediaan.length > 0) {
      const latestKesediaan = employee.kesediaan[0]
      setForm({
        tanggal: new Date(latestKesediaan.tanggal).toISOString().split('T')[0],
        isBersedia: latestKesediaan.isBersedia ? "true" : "false",
        alasanKesanggupan: latestKesediaan.alasanKesanggupan || "",
        kesediaanHariKerja: latestKesediaan.kesediaanHariKerja || "",
        photo: latestKesediaan.photo || "",
      })
      setFilePreview(latestKesediaan.photo || null)
    } else {
      setForm({
        tanggal: new Date().toISOString().split('T')[0],
        isBersedia: "true",
        alasanKesanggupan: "",
        kesediaanHariKerja: "",
        photo: "",
      })
      setFilePreview(null)
    }
  }, [employee, open])

  const handleSubmit = async () => {
    if (!employee) return

    setIsPending(true)
    try {
      const existingKesediaan = employee.kesediaan && employee.kesediaan.length > 0 ? employee.kesediaan[0] : null

      if (existingKesediaan) {
        const result = await updateKesediaan(existingKesediaan.id, {
          tanggal: new Date(form.tanggal),
          isBersedia: form.isBersedia === "true",
          alasanKesanggupan: form.alasanKesanggupan || undefined,
          kesediaanHariKerja: form.kesediaanHariKerja || undefined,
          photo: form.photo || undefined,
        })
        if (result.success) {
          toast.success("Data kesediaan berhasil diperbarui")
          onOpenChange(false)
          onSuccess()
        } else {
          toast.error(result.error || "Gagal memperbarui" + ((result as any).details ? `: ${(result as any).details}` : ""))
        }
      } else {
        const result = await createKesediaan({
          employeeId: employee.id,
          tanggal: new Date(form.tanggal),
          isBersedia: form.isBersedia === "true",
          alasanKesanggupan: form.alasanKesanggupan || undefined,
          kesediaanHariKerja: form.kesediaanHariKerja || undefined,
          photo: form.photo || undefined,
        })
        if (result.success) {
          toast.success("Data kesediaan berhasil ditambahkan")
          onOpenChange(false)
          onSuccess()
        } else {
          toast.error(result.error || "Gagal menambahkan" + ((result as any).details ? `: ${(result as any).details}` : ""))
        }
      }
    } finally {
      setIsPending(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFilePreview(base64)
        setForm({ ...form, photo: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[90vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee && employee.kesediaan && employee.kesediaan.length > 0
              ? "Update Form Kesediaan"
              : "Isi Form Kesediaan"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                id="tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Keterangan</Label>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1">KESEDIAAN</h3>
                <div className="h-1 w-20 bg-blue-600 dark:bg-blue-400 rounded"></div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {KETERANGAN_KESEDIAAN}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kesediaan</Label>
            <RadioGroup value={form.isBersedia} onValueChange={(v) => setForm({ ...form, isBersedia: v })}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="bersedia" />
                <Label htmlFor="bersedia">Bersedia</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="tidak-bersedia" />
                <Label htmlFor="tidak-bersedia">Tidak Bersedia</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alasanKesanggupan">Alasan Kesanggupan</Label>
            <Textarea
              id="alasanKesanggupan"
              value={form.alasanKesanggupan}
              onChange={(e) => setForm({ ...form, alasanKesanggupan: e.target.value })}
              placeholder="Jelaskan alasan kesanggupan Anda..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kesediaanHariKerja">Kesediaan Hari Bekerja</Label>
            <Textarea
              id="kesediaanHariKerja"
              value={form.kesediaanHariKerja}
              onChange={(e) => setForm({ ...form, kesediaanHariKerja: e.target.value })}
              placeholder="Sebutkan hari-hari yang bersedia untuk bekerja..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Upload Photo</Label>
            <Input
              id="photo"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            {filePreview && (
              <div className="flex items-center gap-2 mt-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Photo terpilih</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilePreview(null)
                    setForm({ ...form, photo: "" })
                  }}
                >
                  Hapus
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {employee && employee.kesediaan && employee.kesediaan.length > 0 ? "Update" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
