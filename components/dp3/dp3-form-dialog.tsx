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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2, Calculator } from "lucide-react"
import { toast } from "sonner"
import { createDP3, updateDP3 } from "@/server/actions/dp3"
import { getDP3 } from "@/server/actions/dp3"

interface Year {
  id: string
  name: string
}

interface Employee {
  id: string
  fullName: string
  employeeIdNumber: string
  dp3?: Array<{
    id: string
    tahunId: string
    statusDP3Id: string
    kualitasKerjaNilai: number
    kualitasKerjaAlasan: string | null
    kehadiranDanKedisiplinanNilai: number
    kehadiranDanKedisiplinanAlasan: string | null
    kerjasamaTimNilai: number
    kerjasamaTimAlasan: string | null
    komitmenVisiMisiNilai: number
    komitmenVisiMisiAlasan: string | null
    pengembanganDiriNilai: number
    pengembanganDiriAlasan: string | null
    penggunaanTeknologiNilai: number
    penggunaanTeknologiAlasan: string | null
    ketaatanKepatuhanNilai: number
    ketaatanKepatuhanAlasan: string | null
    komunikasiEfektifNilai: number
    komunikasiEfektifAlasan: string | null
    inisiatifProblemSolvingNilai: number
    inisiatifProblemSolvingAlasan: string | null
    jumlah: number
    rataRata: number
    bobot: number
  }>
}

interface DP3FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
  years: Year[]
  onSuccess: () => void
}

export function DP3FormDialog({
  open,
  onOpenChange,
  employee,
  years,
  onSuccess,
}: DP3FormDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const [statusDP3List, setStatusDP3List] = useState<any[]>([])
  const [form, setForm] = useState<{
    tahunId: string
    statusDP3Id: string
    kualitasKerjaNilai: string
    kualitasKerjaAlasan: string
    kehadiranDanKedisiplinanNilai: string
    kehadiranDanKedisiplinanAlasan: string
    kerjasamaTimNilai: string
    kerjasamaTimAlasan: string
    komitmenVisiMisiNilai: string
    komitmenVisiMisiAlasan: string
    pengembanganDiriNilai: string
    pengembanganDiriAlasan: string
    penggunaanTeknologiNilai: string
    penggunaanTeknologiAlasan: string
    ketaatanKepatuhanNilai: string
    ketaatanKepatuhanAlasan: string
    komunikasiEfektifNilai: string
    komunikasiEfektifAlasan: string
    inisiatifProblemSolvingNilai: string
    inisiatifProblemSolvingAlasan: string
  }>({
    tahunId: "",
    statusDP3Id: "",
    kualitasKerjaNilai: "0",
    kualitasKerjaAlasan: "",
    kehadiranDanKedisiplinanNilai: "0",
    kehadiranDanKedisiplinanAlasan: "",
    kerjasamaTimNilai: "0",
    kerjasamaTimAlasan: "",
    komitmenVisiMisiNilai: "0",
    komitmenVisiMisiAlasan: "",
    pengembanganDiriNilai: "0",
    pengembanganDiriAlasan: "",
    penggunaanTeknologiNilai: "0",
    penggunaanTeknologiAlasan: "",
    ketaatanKepatuhanNilai: "0",
    ketaatanKepatuhanAlasan: "",
    komunikasiEfektifNilai: "0",
    komunikasiEfektifAlasan: "",
    inisiatifProblemSolvingNilai: "0",
    inisiatifProblemSolvingAlasan: "",
  })

  useEffect(() => {
    const fetchStatusDP3 = async () => {
      const response = await fetch('/api/status-dp3')
      const data = await response.json()
      if (data.success) setStatusDP3List(data.data)
    }
    fetchStatusDP3()
  }, [])

  useEffect(() => {
    if (employee && employee.dp3 && employee.dp3.length > 0) {
      const latestDP3 = employee.dp3[0]
      setForm({
        tahunId: latestDP3.tahunId || "",
        statusDP3Id: latestDP3.statusDP3Id || "",
        kualitasKerjaNilai: (latestDP3.kualitasKerjaNilai ?? 0).toString(),
        kualitasKerjaAlasan: latestDP3.kualitasKerjaAlasan || "",
        kehadiranDanKedisiplinanNilai: (latestDP3.kehadiranDanKedisiplinanNilai ?? 0).toString(),
        kehadiranDanKedisiplinanAlasan: latestDP3.kehadiranDanKedisiplinanAlasan || "",
        kerjasamaTimNilai: (latestDP3.kerjasamaTimNilai ?? 0).toString(),
        kerjasamaTimAlasan: latestDP3.kerjasamaTimAlasan || "",
        komitmenVisiMisiNilai: (latestDP3.komitmenVisiMisiNilai ?? 0).toString(),
        komitmenVisiMisiAlasan: latestDP3.komitmenVisiMisiAlasan || "",
        pengembanganDiriNilai: (latestDP3.pengembanganDiriNilai ?? 0).toString(),
        pengembanganDiriAlasan: latestDP3.pengembanganDiriAlasan || "",
        penggunaanTeknologiNilai: (latestDP3.penggunaanTeknologiNilai ?? 0).toString(),
        penggunaanTeknologiAlasan: latestDP3.penggunaanTeknologiAlasan || "",
        ketaatanKepatuhanNilai: (latestDP3.ketaatanKepatuhanNilai ?? 0).toString(),
        ketaatanKepatuhanAlasan: latestDP3.ketaatanKepatuhanAlasan || "",
        komunikasiEfektifNilai: (latestDP3.komunikasiEfektifNilai ?? 0).toString(),
        komunikasiEfektifAlasan: latestDP3.komunikasiEfektifAlasan || "",
        inisiatifProblemSolvingNilai: (latestDP3.inisiatifProblemSolvingNilai ?? 0).toString(),
        inisiatifProblemSolvingAlasan: latestDP3.inisiatifProblemSolvingAlasan || "",
      })
    } else {
      setForm({
        tahunId: "",
        statusDP3Id: "",
        kualitasKerjaNilai: "0",
        kualitasKerjaAlasan: "",
        kehadiranDanKedisiplinanNilai: "0",
        kehadiranDanKedisiplinanAlasan: "",
        kerjasamaTimNilai: "0",
        kerjasamaTimAlasan: "",
        komitmenVisiMisiNilai: "0",
        komitmenVisiMisiAlasan: "",
        pengembanganDiriNilai: "0",
        pengembanganDiriAlasan: "",
        penggunaanTeknologiNilai: "0",
        penggunaanTeknologiAlasan: "",
        ketaatanKepatuhanNilai: "0",
        ketaatanKepatuhanAlasan: "",
        komunikasiEfektifNilai: "0",
        komunikasiEfektifAlasan: "",
        inisiatifProblemSolvingNilai: "0",
        inisiatifProblemSolvingAlasan: "",
      })
    }
  }, [employee, open])

  const calculateResults = () => {
    const nilaiList = [
      parseInt(form.kualitasKerjaNilai) || 0,
      parseInt(form.kehadiranDanKedisiplinanNilai) || 0,
      parseInt(form.kerjasamaTimNilai) || 0,
      parseInt(form.komitmenVisiMisiNilai) || 0,
      parseInt(form.pengembanganDiriNilai) || 0,
      parseInt(form.penggunaanTeknologiNilai) || 0,
      parseInt(form.ketaatanKepatuhanNilai) || 0,
      parseInt(form.komunikasiEfektifNilai) || 0,
      parseInt(form.inisiatifProblemSolvingNilai) || 0,
    ]
    const jumlah = nilaiList.reduce((a, b) => a + b, 0)
    const rataRata = Math.round(jumlah / nilaiList.length)
    const bobot = Math.round((jumlah / 100) * 100) // Assuming max score is 100
    return { jumlah, rataRata, bobot }
  }

  const results = calculateResults()

  const handleSubmit = async () => {
    if (!employee) return
    if (!form.tahunId) {
      toast.error("Tahun wajib dipilih")
      return
    }
    if (!form.statusDP3Id) {
      toast.error("Status DP3 wajib dipilih")
      return
    }

    // Validate all nilai fields > 0
    const nilaiFields = [
      { name: "Kualitas Kerja", value: parseInt(form.kualitasKerjaNilai) },
      { name: "Kehadiran & Kedisiplinan", value: parseInt(form.kehadiranDanKedisiplinanNilai) },
      { name: "Kerjasama Tim", value: parseInt(form.kerjasamaTimNilai) },
      { name: "Komitmen Visi & Misi", value: parseInt(form.komitmenVisiMisiNilai) },
      { name: "Pengembangan Diri", value: parseInt(form.pengembanganDiriNilai) },
      { name: "Penggunaan Teknologi", value: parseInt(form.penggunaanTeknologiNilai) },
      { name: "Ketaatan/Kepatuhan", value: parseInt(form.ketaatanKepatuhanNilai) },
      { name: "Komunikasi Efektif", value: parseInt(form.komunikasiEfektifNilai) },
      { name: "Inisiatif & Problem Solving", value: parseInt(form.inisiatifProblemSolvingNilai) },
    ]

    for (const field of nilaiFields) {
      if (!field.value || field.value <= 0) {
        toast.error(`${field.name} - Nilai harus lebih besar dari 0`)
        return
      }
    }

    // Validate all alasan fields must be filled
    const alasanFields = [
      { name: "Kualitas Kerja", value: form.kualitasKerjaAlasan },
      { name: "Kehadiran & Kedisiplinan", value: form.kehadiranDanKedisiplinanAlasan },
      { name: "Kerjasama Tim", value: form.kerjasamaTimAlasan },
      { name: "Komitmen Visi & Misi", value: form.komitmenVisiMisiAlasan },
      { name: "Pengembangan Diri", value: form.pengembanganDiriAlasan },
      { name: "Penggunaan Teknologi", value: form.penggunaanTeknologiAlasan },
      { name: "Ketaatan/Kepatuhan", value: form.ketaatanKepatuhanAlasan },
      { name: "Komunikasi Efektif", value: form.komunikasiEfektifAlasan },
      { name: "Inisiatif & Problem Solving", value: form.inisiatifProblemSolvingAlasan },
    ]

    for (const field of alasanFields) {
      if (!field.value || field.value.trim() === "") {
        toast.error(`${field.name} - Alasan wajib diisi`)
        return
      }
    }

    setIsPending(true)
    try {
      const existingDP3 = employee.dp3 && employee.dp3.length > 0 ? employee.dp3[0] : null
      const calculatedResults = calculateResults()

      if (existingDP3) {
        const result = await updateDP3(existingDP3.id, {
          tahunId: form.tahunId,
          statusDP3Id: form.statusDP3Id,
          kualitasKerjaNilai: parseInt(form.kualitasKerjaNilai),
          kualitasKerjaAlasan: form.kualitasKerjaAlasan || undefined,
          kehadiranDanKedisiplinanNilai: parseInt(form.kehadiranDanKedisiplinanNilai),
          kehadiranDanKedisiplinanAlasan: form.kehadiranDanKedisiplinanAlasan || undefined,
          kerjasamaTimNilai: parseInt(form.kerjasamaTimNilai),
          kerjasamaTimAlasan: form.kerjasamaTimAlasan || undefined,
          komitmenVisiMisiNilai: parseInt(form.komitmenVisiMisiNilai),
          komitmenVisiMisiAlasan: form.komitmenVisiMisiAlasan || undefined,
          pengembanganDiriNilai: parseInt(form.pengembanganDiriNilai),
          pengembanganDiriAlasan: form.pengembanganDiriAlasan || undefined,
          penggunaanTeknologiNilai: parseInt(form.penggunaanTeknologiNilai),
          penggunaanTeknologiAlasan: form.penggunaanTeknologiAlasan || undefined,
          ketaatanKepatuhanNilai: parseInt(form.ketaatanKepatuhanNilai),
          ketaatanKepatuhanAlasan: form.ketaatanKepatuhanAlasan || undefined,
          komunikasiEfektifNilai: parseInt(form.komunikasiEfektifNilai),
          komunikasiEfektifAlasan: form.komunikasiEfektifAlasan || undefined,
          inisiatifProblemSolvingNilai: parseInt(form.inisiatifProblemSolvingNilai),
          inisiatifProblemSolvingAlasan: form.inisiatifProblemSolvingAlasan || undefined,
          jumlah: calculatedResults.jumlah,
          rataRata: calculatedResults.rataRata,
          bobot: calculatedResults.bobot,
        })
        if (result.success) {
          toast.success("Data DP3 berhasil diperbarui")
          onOpenChange(false)
          onSuccess()
        } else {
          toast.error(result.error || "Gagal memperbarui" + ((result as any).details ? `: ${(result as any).details}` : ""))
        }
      } else {
        const result = await createDP3({
          employeeId: employee.id,
          tahunId: form.tahunId,
          statusDP3Id: form.statusDP3Id,
          kualitasKerjaNilai: parseInt(form.kualitasKerjaNilai),
          kualitasKerjaAlasan: form.kualitasKerjaAlasan || undefined,
          kehadiranDanKedisiplinanNilai: parseInt(form.kehadiranDanKedisiplinanNilai),
          kehadiranDanKedisiplinanAlasan: form.kehadiranDanKedisiplinanAlasan || undefined,
          kerjasamaTimNilai: parseInt(form.kerjasamaTimNilai),
          kerjasamaTimAlasan: form.kerjasamaTimAlasan || undefined,
          komitmenVisiMisiNilai: parseInt(form.komitmenVisiMisiNilai),
          komitmenVisiMisiAlasan: form.komitmenVisiMisiAlasan || undefined,
          pengembanganDiriNilai: parseInt(form.pengembanganDiriNilai),
          pengembanganDiriAlasan: form.pengembanganDiriAlasan || undefined,
          penggunaanTeknologiNilai: parseInt(form.penggunaanTeknologiNilai),
          penggunaanTeknologiAlasan: form.penggunaanTeknologiAlasan || undefined,
          ketaatanKepatuhanNilai: parseInt(form.ketaatanKepatuhanNilai),
          ketaatanKepatuhanAlasan: form.ketaatanKepatuhanAlasan || undefined,
          komunikasiEfektifNilai: parseInt(form.komunikasiEfektifNilai),
          komunikasiEfektifAlasan: form.komunikasiEfektifAlasan || undefined,
          inisiatifProblemSolvingNilai: parseInt(form.inisiatifProblemSolvingNilai),
          inisiatifProblemSolvingAlasan: form.inisiatifProblemSolvingAlasan || undefined,
          jumlah: calculatedResults.jumlah,
          rataRata: calculatedResults.rataRata,
          bobot: calculatedResults.bobot,
        })
        if (result.success) {
          toast.success("Data DP3 berhasil ditambahkan")
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[90vw] max-h-[85vh] !p-0 flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {employee && employee.dp3 && employee.dp3.length > 0
              ? "Update Penilaian DP3"
              : "Isi Penilaian DP3"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tahun">Tahun</Label>
              <Select value={form.tahunId} onValueChange={(v) => setForm({ ...form, tahunId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="kualitasKerjaNilai">Kualitas Kerja - Nilai</Label>
                  <Input
                    id="kualitasKerjaNilai"
                    type="number"
                    value={form.kualitasKerjaNilai}
                    onChange={(e) => setForm({ ...form, kualitasKerjaNilai: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kualitasKerjaAlasan">Alasan</Label>
                  <Textarea
                    id="kualitasKerjaAlasan"
                    value={form.kualitasKerjaAlasan}
                    onChange={(e) => setForm({ ...form, kualitasKerjaAlasan: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="kehadiranDanKedisiplinanNilai">Kehadiran & Kedisiplinan - Nilai</Label>
                  <Input
                    id="kehadiranDanKedisiplinanNilai"
                    type="number"
                    value={form.kehadiranDanKedisiplinanNilai}
                    onChange={(e) => setForm({ ...form, kehadiranDanKedisiplinanNilai: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kehadiranDanKedisiplinanAlasan">Alasan</Label>
                  <Textarea
                    id="kehadiranDanKedisiplinanAlasan"
                    value={form.kehadiranDanKedisiplinanAlasan}
                    onChange={(e) => setForm({ ...form, kehadiranDanKedisiplinanAlasan: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="kerjasamaTimNilai">Kerjasama Tim - Nilai</Label>
                  <Input
                    id="kerjasamaTimNilai"
                    type="number"
                    value={form.kerjasamaTimNilai}
                    onChange={(e) => setForm({ ...form, kerjasamaTimNilai: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kerjasamaTimAlasan">Alasan</Label>
                  <Textarea
                    id="kerjasamaTimAlasan"
                    value={form.kerjasamaTimAlasan}
                    onChange={(e) => setForm({ ...form, kerjasamaTimAlasan: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="komitmenVisiMisiNilai">Komitmen Visi & Misi - Nilai</Label>
                  <Input
                    id="komitmenVisiMisiNilai"
                    type="number"
                    value={form.komitmenVisiMisiNilai}
                    onChange={(e) => setForm({ ...form, komitmenVisiMisiNilai: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="komitmenVisiMisiAlasan">Alasan</Label>
                  <Textarea
                    id="komitmenVisiMisiAlasan"
                    value={form.komitmenVisiMisiAlasan}
                    onChange={(e) => setForm({ ...form, komitmenVisiMisiAlasan: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="pengembanganDiriNilai">Pengembangan Diri - Nilai</Label>
                  <Input
                    id="pengembanganDiriNilai"
                    type="number"
                    value={form.pengembanganDiriNilai}
                    onChange={(e) => setForm({ ...form, pengembanganDiriNilai: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pengembanganDiriAlasan">Alasan</Label>
                  <Textarea
                    id="pengembanganDiriAlasan"
                    value={form.pengembanganDiriAlasan}
                    onChange={(e) => setForm({ ...form, pengembanganDiriAlasan: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="penggunaanTeknologiNilai">Penggunaan Teknologi - Nilai</Label>
                  <Input
                    id="penggunaanTeknologiNilai"
                    type="number"
                    value={form.penggunaanTeknologiNilai}
                    onChange={(e) => setForm({ ...form, penggunaanTeknologiNilai: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="penggunaanTeknologiAlasan">Alasan</Label>
                  <Textarea
                    id="penggunaanTeknologiAlasan"
                    value={form.penggunaanTeknologiAlasan}
                    onChange={(e) => setForm({ ...form, penggunaanTeknologiAlasan: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="ketaatanKepatuhanNilai">Ketaatan/Kepatuhan - Nilai</Label>
                  <Input
                    id="ketaatanKepatuhanNilai"
                    type="number"
                    value={form.ketaatanKepatuhanNilai}
                    onChange={(e) => setForm({ ...form, ketaatanKepatuhanNilai: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ketaatanKepatuhanAlasan">Alasan</Label>
                  <Textarea
                    id="ketaatanKepatuhanAlasan"
                    value={form.ketaatanKepatuhanAlasan}
                    onChange={(e) => setForm({ ...form, ketaatanKepatuhanAlasan: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="komunikasiEfektifNilai">Komunikasi Efektif - Nilai</Label>
                  <Input
                    id="komunikasiEfektifNilai"
                    type="number"
                    value={form.komunikasiEfektifNilai}
                    onChange={(e) => setForm({ ...form, komunikasiEfektifNilai: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="komunikasiEfektifAlasan">Alasan</Label>
                  <Textarea
                    id="komunikasiEfektifAlasan"
                    value={form.komunikasiEfektifAlasan}
                    onChange={(e) => setForm({ ...form, komunikasiEfektifAlasan: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="inisiatifProblemSolvingNilai">Inisiatif & Problem Solving - Nilai</Label>
                  <Input
                    id="inisiatifProblemSolvingNilai"
                    type="number"
                    value={form.inisiatifProblemSolvingNilai}
                    onChange={(e) => setForm({ ...form, inisiatifProblemSolvingNilai: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inisiatifProblemSolvingAlasan">Alasan</Label>
                  <Textarea
                    id="inisiatifProblemSolvingAlasan"
                    value={form.inisiatifProblemSolvingAlasan}
                    onChange={(e) => setForm({ ...form, inisiatifProblemSolvingAlasan: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusDP3">Status DP3</Label>
              <Select value={form.statusDP3Id} onValueChange={(v) => setForm({ ...form, statusDP3Id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusDP3List.map((status) => (
                    <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="bg-background border-t p-4 shadow-lg">
          <div className="flex items-center justify-center gap-6">
            <Calculator className="h-5 w-5" />
            <div className="flex gap-8">
              <div>
                <span className="text-sm text-muted-foreground">Jumlah:</span>
                <span className="ml-2 font-bold">{results.jumlah}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Rata-rata:</span>
                <span className="ml-2 font-bold">{results.rataRata}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Bobot:</span>
                <span className="ml-2 font-bold">{results.bobot}</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="p-6 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {employee && employee.dp3 && employee.dp3.length > 0 ? "Update" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
