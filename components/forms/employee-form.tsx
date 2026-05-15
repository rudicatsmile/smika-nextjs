"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, ArrowLeft, User, Briefcase, GraduationCap, MapPin } from "lucide-react"
import { toast } from "sonner"
import { createEmployee, updateEmployee, type EmployeeFormData } from "@/server/actions/pegawai"
import Link from "next/link"

const schema = z.object({
  employeeIdNumber: z.string().min(1, "NIP wajib diisi"),
  nationalIdNumber: z.string().optional().nullable(),
  bpjsNumber: z.string().optional().nullable(),
  taxIdNumber: z.string().optional().nullable(),
  educatorIdNumber: z.string().optional().nullable(),
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  profilePhoto: z.string().optional().nullable(),
  placeOfBirth: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]).optional().nullable(),
  maritalStatus: z.enum(["BELUM_MENIKAH", "MENIKAH", "CERAI_HIDUP", "CERAI_MATI"]).optional().nullable(),
  employmentStatus: z.enum(["AKTIF", "NON_AKTIF", "CUTI", "PENSIUN"]).default("AKTIF"),
  isBlocked: z.boolean().default(false),
  address: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  secondaryAddress: z.string().optional().nullable(),
  secondaryProvince: z.string().optional().nullable(),
  secondaryPostalCode: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  hobbies: z.string().optional().nullable(),
  height: z.coerce.number().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),
  positionUnit: z.string().optional().nullable(),
  positionData: z.string().optional().nullable(),
  functionUnit: z.string().optional().nullable(),
  taskUnit: z.string().optional().nullable(),
  teachingUnit: z.string().optional().nullable(),
  joinDate: z.string().optional().nullable(),
  highestEducation: z.string().optional().nullable(),
  major: z.string().optional().nullable(),
  institutionName: z.string().optional().nullable(),
  graduationYear: z.coerce.number().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  positionId: z.string().optional().nullable(),
  employmentStatusId: z.string().optional().nullable(),
  religionId: z.string().optional().nullable(),
  bloodTypeId: z.string().optional().nullable(),
})

type FormValues = z.infer<typeof schema>

interface MasterOption { id: string; name: string }

interface EmployeeFormProps {
  initialData?: Partial<FormValues & { id: string }>
  departments: MasterOption[]
  positions: MasterOption[]
  religions: MasterOption[]
  bloodTypes: MasterOption[]
  employmentStatuses: MasterOption[]
  educations: MasterOption[]
  mode: "create" | "edit"
}

function FormField({
  label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function EmployeeForm({
  initialData, departments, positions, religions, bloodTypes, employmentStatuses, educations, mode,
}: EmployeeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const toDateStr = (d: Date | string | null | undefined) => {
    if (!d) return ""
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return ""
    return dt.toISOString().slice(0, 10)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setPhotoPreview(base64)
        setValue("profilePhoto", base64)
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    if (initialData?.profilePhoto) {
      setPhotoPreview(initialData.profilePhoto)
    }
  }, [initialData?.profilePhoto])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      ...initialData,
      employmentStatus: (initialData?.employmentStatus as any) ?? "AKTIF",
      isBlocked: initialData?.isBlocked ?? false,
      dateOfBirth: toDateStr(initialData?.dateOfBirth as any),
      joinDate: toDateStr(initialData?.joinDate as any),
      gender: (initialData?.gender as any) ?? null,
      maritalStatus: (initialData?.maritalStatus as any) ?? null,
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    startTransition(async () => {
      const payload = data as EmployeeFormData
      const result = mode === "create"
        ? await createEmployee(payload)
        : await updateEmployee(initialData!.id!, payload)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(mode === "create" ? "Pegawai berhasil ditambahkan!" : "Data berhasil diperbarui!")
        const newId = (result as any).id
        if (mode === "create" && newId) {
          router.push(`/pegawai/${newId}`)
        } else {
          router.push(`/pegawai/${initialData!.id}`)
        }
      }
    })
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={mode === "edit" ? `/pegawai/${initialData?.id}` : "/pegawai"}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">
          {mode === "create" ? "Tambah Pegawai Baru" : "Edit Data Pegawai"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="personal" className="text-xs"><User className="h-3.5 w-3.5 mr-1 hidden sm:block" />Personal</TabsTrigger>
            <TabsTrigger value="pekerjaan" className="text-xs"><Briefcase className="h-3.5 w-3.5 mr-1 hidden sm:block" />Pekerjaan</TabsTrigger>
            <TabsTrigger value="pendidikan" className="text-xs"><GraduationCap className="h-3.5 w-3.5 mr-1 hidden sm:block" />Pendidikan</TabsTrigger>
            <TabsTrigger value="alamat" className="text-xs"><MapPin className="h-3.5 w-3.5 mr-1 hidden sm:block" />Alamat</TabsTrigger>
          </TabsList>

          {/* Personal */}
          <TabsContent value="personal">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Foto Profil</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-24 h-24 rounded-full object-cover border-2 border-border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full"
                          onClick={() => {
                            setPhotoPreview(null)
                            setValue("profilePhoto", null)
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Label htmlFor="photo" className="text-sm">Upload Foto</Label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: JPG, PNG. Maksimal 2MB.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Identitas Utama</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                  <FormField label="Nama Lengkap" error={errors.fullName?.message} required>
                    <Input {...register("fullName")} placeholder="Nama lengkap sesuai KTP" />
                  </FormField>
                  <FormField label="NIP" error={errors.employeeIdNumber?.message} required>
                    <Input {...register("employeeIdNumber")} placeholder="Nomor Induk Pegawai" />
                  </FormField>
                  <FormField label="NIK">
                    <Input {...register("nationalIdNumber")} placeholder="Nomor KTP" />
                  </FormField>
                  <FormField label="NUPTK">
                    <Input {...register("educatorIdNumber")} placeholder="Nomor Unik PTK" />
                  </FormField>
                  <FormField label="No. BPJS">
                    <Input {...register("bpjsNumber")} placeholder="Nomor BPJS Ketenagakerjaan" />
                  </FormField>
                  <FormField label="NPWP">
                    <Input {...register("taxIdNumber")} placeholder="Nomor Pokok Wajib Pajak" />
                  </FormField>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Data Pribadi</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField label="Tempat Lahir">
                    <Input {...register("placeOfBirth")} placeholder="Kota/Kabupaten" />
                  </FormField>
                  <FormField label="Tanggal Lahir">
                    <Input type="date" {...register("dateOfBirth")} />
                  </FormField>
                  <FormField label="Jenis Kelamin">
                    <Select
                      value={watch("gender") ?? ""}
                      onValueChange={(v) => setValue("gender", v as any || null)}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                        <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Status Pernikahan">
                    <Select
                      value={watch("maritalStatus") ?? ""}
                      onValueChange={(v) => setValue("maritalStatus", v as any || null)}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BELUM_MENIKAH">Belum Menikah</SelectItem>
                        <SelectItem value="MENIKAH">Menikah</SelectItem>
                        <SelectItem value="CERAI_HIDUP">Cerai Hidup</SelectItem>
                        <SelectItem value="CERAI_MATI">Cerai Mati</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Agama">
                    <Select
                      value={watch("religionId") ?? ""}
                      onValueChange={(v) => setValue("religionId", v || null)}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih agama" /></SelectTrigger>
                      <SelectContent>
                        {religions.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Golongan Darah">
                    <Select
                      value={watch("bloodTypeId") ?? ""}
                      onValueChange={(v) => setValue("bloodTypeId", v || null)}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih golongan darah" /></SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Tinggi (cm)">
                      <Input type="number" {...register("height")} placeholder="170" />
                    </FormField>
                    <FormField label="Berat (kg)">
                      <Input type="number" {...register("weight")} placeholder="65" />
                    </FormField>
                  </div>
                  <FormField label="Hobi">
                    <Input {...register("hobbies")} placeholder="Membaca, olahraga..." />
                  </FormField>
                  <FormField label="Email">
                    <Input type="email" {...register("email")} placeholder="email@contoh.com" />
                  </FormField>
                  <FormField label="Nomor Telepon">
                    <Input {...register("phoneNumber")} placeholder="08xxxxxxxxxx" />
                  </FormField>
                </CardContent>
              </Card>
              </div>
            </div>
          </TabsContent>

          {/* Pekerjaan */}
          <TabsContent value="pekerjaan">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Data Kepegawaian</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField label="Unit / Departemen">
                    <Select
                      value={watch("departmentId") ?? ""}
                      onValueChange={(v) => setValue("departmentId", v || null)}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih unit" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Jabatan">
                    <Select
                      value={watch("positionId") ?? ""}
                      onValueChange={(v) => setValue("positionId", v || null)}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih jabatan" /></SelectTrigger>
                      <SelectContent>
                        {positions.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Status Kepegawaian (Jenis)">
                    <Select
                      value={watch("employmentStatusId") ?? ""}
                      onValueChange={(v) => setValue("employmentStatusId", v || null)}
                    >
                      <SelectTrigger><SelectValue placeholder="PNS, Honorer, dll." /></SelectTrigger>
                      <SelectContent>
                        {employmentStatuses.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Status Aktif">
                    <Select
                      value={watch("employmentStatus")}
                      onValueChange={(v) => setValue("employmentStatus", v as any)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AKTIF">Aktif</SelectItem>
                        <SelectItem value="NON_AKTIF">Non Aktif</SelectItem>
                        <SelectItem value="CUTI">Cuti</SelectItem>
                        <SelectItem value="PENSIUN">Pensiun</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Tanggal Bergabung">
                    <Input type="date" {...register("joinDate")} />
                  </FormField>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Tugas & Fungsi</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField label="Unit Posisi">
                    <Input {...register("positionUnit")} />
                  </FormField>
                  <FormField label="Data Posisi">
                    <Input {...register("positionData")} />
                  </FormField>
                  <FormField label="Unit Fungsi">
                    <Input {...register("functionUnit")} />
                  </FormField>
                  <FormField label="Unit Tugas">
                    <Input {...register("taskUnit")} />
                  </FormField>
                  <FormField label="Unit Mengajar">
                    <Input {...register("teachingUnit")} />
                  </FormField>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pendidikan */}
          <TabsContent value="pendidikan">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Pendidikan Terakhir</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Pendidikan Terakhir">
                  <Select
                    value={watch("highestEducation") ?? ""}
                    onValueChange={(v) => setValue("highestEducation", v || null)}
                  >
                    <SelectTrigger><SelectValue placeholder="Pilih jenjang" /></SelectTrigger>
                    <SelectContent>
                      {educations.map((e) => (
                        <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Jurusan / Program Studi">
                  <Input {...register("major")} placeholder="Pendidikan Islam, Hukum..." />
                </FormField>
                <FormField label="Nama Institusi">
                  <Input {...register("institutionName")} placeholder="Universitas / Sekolah" />
                </FormField>
                <FormField label="Tahun Lulus">
                  <Input type="number" {...register("graduationYear")} placeholder="2010" min={1950} max={2099} />
                </FormField>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alamat */}
          <TabsContent value="alamat">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Alamat Tinggal</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField label="Alamat Lengkap">
                    <Textarea {...register("address")} placeholder="Jl. ... No. ..." rows={3} />
                  </FormField>
                  <FormField label="Provinsi">
                    <Input {...register("province")} placeholder="DKI Jakarta" />
                  </FormField>
                  <FormField label="Kode Pos">
                    <Input {...register("postalCode")} placeholder="12345" maxLength={5} />
                  </FormField>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Alamat Asal (Opsional)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField label="Alamat Lengkap">
                    <Textarea {...register("secondaryAddress")} placeholder="Jl. ... No. ..." rows={3} />
                  </FormField>
                  <FormField label="Provinsi">
                    <Input {...register("secondaryProvince")} />
                  </FormField>
                  <FormField label="Kode Pos">
                    <Input {...register("secondaryPostalCode")} maxLength={5} />
                  </FormField>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit */}
        <div className="flex justify-end gap-3 mt-4 sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 border-t border-border -mx-4 px-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {mode === "create" ? "Simpan Pegawai" : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  )
}
