"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, User, Briefcase, GraduationCap, FileText, Clock, MapPin, Phone, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { id } from "date-fns/locale"

const STATUS_COLORS: Record<string, string> = {
  AKTIF: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  NON_AKTIF: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  CUTI: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  PENSIUN: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
}
const STATUS_LABELS: Record<string, string> = {
  AKTIF: "Aktif", NON_AKTIF: "Non Aktif", CUTI: "Cuti", PENSIUN: "Pensiun",
}
const GENDER_LABELS: Record<string, string> = {
  LAKI_LAKI: "Laki-laki", PEREMPUAN: "Perempuan",
}
const MARITAL_LABELS: Record<string, string> = {
  BELUM_MENIKAH: "Belum Menikah", MENIKAH: "Menikah",
  CERAI_HIDUP: "Cerai Hidup", CERAI_MATI: "Cerai Mati",
}
const EDU_LABELS: Record<string, string> = {
  SD: "SD", SMP: "SMP", SMA_SMK: "SMA/SMK",
  D1: "D1", D2: "D2", D3: "D3", D4: "D4",
  S1: "S1 (Sarjana)", S2: "S2 (Magister)", S3: "S3 (Doktor)",
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-2 gap-2 py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right break-words">{value ?? "-"}</span>
    </div>
  )
}

export function EmployeeDetailClient({ employee }: { employee: any }) {
  const initials = employee.fullName.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pegawai"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Detail Pegawai</h1>
        </div>
        <Button asChild>
          <Link href={`/pegawai/${employee.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />Edit Data
          </Link>
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                {employee.profilePhoto && <AvatarImage src={employee.profilePhoto} alt={employee.fullName} />}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-xl font-bold">{employee.fullName}</h2>
                <p className="text-muted-foreground font-mono text-sm">{employee.employeeIdNumber}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={STATUS_COLORS[employee.employmentStatus] ?? "bg-muted"} variant="secondary">
                  {STATUS_LABELS[employee.employmentStatus] ?? employee.employmentStatus}
                </Badge>
                {employee.isBlocked && (
                  <Badge variant="destructive">Diblokir</Badge>
                )}
                {employee.department && (
                  <Badge variant="outline">{employee.department.name}</Badge>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {employee.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />{employee.email}
                  </div>
                )}
                {employee.phoneNumber && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />{employee.phoneNumber}
                  </div>
                )}
                {employee.joinDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Bergabung {format(new Date(employee.joinDate), "d MMM yyyy", { locale: id })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="personal" className="text-xs"><User className="h-3.5 w-3.5 mr-1 hidden sm:block" />Personal</TabsTrigger>
          <TabsTrigger value="pekerjaan" className="text-xs"><Briefcase className="h-3.5 w-3.5 mr-1 hidden sm:block" />Pekerjaan</TabsTrigger>
          <TabsTrigger value="pendidikan" className="text-xs"><GraduationCap className="h-3.5 w-3.5 mr-1 hidden sm:block" />Pendidikan</TabsTrigger>
          <TabsTrigger value="dokumen" className="text-xs"><FileText className="h-3.5 w-3.5 mr-1 hidden sm:block" />Dokumen</TabsTrigger>
          <TabsTrigger value="riwayat" className="text-xs"><Clock className="h-3.5 w-3.5 mr-1 hidden sm:block" />Riwayat</TabsTrigger>
        </TabsList>

        {/* Personal */}
        <TabsContent value="personal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Data Pribadi</CardTitle></CardHeader>
              <CardContent className="space-y-0">
                <DetailRow label="NIK" value={employee.nationalIdNumber} />
                <DetailRow label="Tempat Lahir" value={employee.placeOfBirth} />
                <DetailRow label="Tanggal Lahir" value={employee.dateOfBirth ? format(new Date(employee.dateOfBirth), "d MMMM yyyy", { locale: id }) : null} />
                <DetailRow label="Jenis Kelamin" value={employee.gender ? GENDER_LABELS[employee.gender] : null} />
                <DetailRow label="Status Pernikahan" value={employee.maritalStatus ? MARITAL_LABELS[employee.maritalStatus] : null} />
                <DetailRow label="Agama" value={employee.religion?.name} />
                <DetailRow label="Golongan Darah" value={employee.bloodType?.name} />
                <DetailRow label="Hobi" value={employee.hobbies} />
                <DetailRow label="Tinggi Badan" value={employee.height ? `${employee.height} cm` : null} />
                <DetailRow label="Berat Badan" value={employee.weight ? `${employee.weight} kg` : null} />
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />Alamat Tinggal</CardTitle></CardHeader>
                <CardContent className="space-y-0">
                  <DetailRow label="Alamat" value={employee.address} />
                  <DetailRow label="Provinsi" value={employee.province} />
                  <DetailRow label="Kode Pos" value={employee.postalCode} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />Alamat Asal</CardTitle></CardHeader>
                <CardContent className="space-y-0">
                  <DetailRow label="Alamat" value={employee.secondaryAddress} />
                  <DetailRow label="Provinsi" value={employee.secondaryProvince} />
                  <DetailRow label="Kode Pos" value={employee.secondaryPostalCode} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Pekerjaan */}
        <TabsContent value="pekerjaan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Data Kepegawaian</CardTitle></CardHeader>
              <CardContent className="space-y-0">
                <DetailRow label="NIP" value={employee.employeeIdNumber} />
                <DetailRow label="NUPTK" value={employee.educatorIdNumber} />
                <DetailRow label="BPJS" value={employee.bpjsNumber} />
                <DetailRow label="NPWP" value={employee.taxIdNumber} />
                <DetailRow label="Unit/Departemen" value={employee.department?.name} />
                <DetailRow label="Jabatan" value={employee.position?.name} />
                <DetailRow label="Status" value={employee.employmentStatusRef?.name} />
                <DetailRow label="Tgl Bergabung" value={employee.joinDate ? format(new Date(employee.joinDate), "d MMMM yyyy", { locale: id }) : null} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Tugas & Fungsi</CardTitle></CardHeader>
              <CardContent className="space-y-0">
                <DetailRow label="Unit Posisi" value={employee.positionUnit} />
                <DetailRow label="Data Posisi" value={employee.positionData} />
                <DetailRow label="Unit Fungsi" value={employee.functionUnit} />
                <DetailRow label="Unit Tugas" value={employee.taskUnit} />
                <DetailRow label="Unit Mengajar" value={employee.teachingUnit} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pendidikan */}
        <TabsContent value="pendidikan">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Pendidikan Terakhir</CardTitle></CardHeader>
            <CardContent className="space-y-0">
              <DetailRow label="Pendidikan Terakhir" value={employee.highestEducation ? (EDU_LABELS[employee.highestEducation] ?? employee.highestEducation) : null} />
              <DetailRow label="Jurusan / Prodi" value={employee.major} />
              <DetailRow label="Nama Institusi" value={employee.institutionName} />
              <DetailRow label="Tahun Lulus" value={employee.graduationYear} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dokumen */}
        <TabsContent value="dokumen">
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm">Dokumen Pegawai</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Belum ada dokumen</p>
              ) : (
                <div className="space-y-2">
                  {employee.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type}</p>
                        </div>
                      </div>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm">Lihat</Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Riwayat */}
        <TabsContent value="riwayat">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Riwayat Pegawai</CardTitle></CardHeader>
            <CardContent>
              {employee.history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Belum ada riwayat</p>
              ) : (
                <div className="space-y-4">
                  {employee.history.map((h: any) => (
                    <div key={h.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                        <div className="w-0.5 bg-border flex-1 mt-2" />
                      </div>
                      <div className="pb-4">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(h.date), "d MMMM yyyy", { locale: id })}
                        </p>
                        <p className="text-sm font-medium">{h.type}</p>
                        <p className="text-sm text-muted-foreground">{h.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
