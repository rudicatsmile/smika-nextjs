"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  ArrowLeft, Edit, User, Briefcase, GraduationCap, FileText, Clock, MapPin,
  Phone, Mail, Calendar, Users as UsersIcon, Award, ScrollText, CheckCircle,
  Building2 as BuildingIcon, Heart as HeartIcon, Users as UsersOrgIcon,
  ChevronLeft, ChevronRight, Copy, Check, ExternalLink, ShieldCheck,
  CreditCard, Sparkles, KeyRound
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"
import { EducationHistoryTable } from "@/components/education/education-history-table"
import { ChildTable } from "@/components/family/child-table"
import { SpouseTable } from "@/components/family/spouse-table"
import { TrainingTable } from "@/components/training/training-table"
import { EmploymentDocumentTable } from "@/components/employment/employment-document-table"
import { CertificationTable } from "@/components/certification/certification-table"
import { WorkUnitTable } from "@/components/work-unit/work-unit-table"
import { HealthDataTable } from "@/components/health/health-data-table"
import { SocialOrganizationTable } from "@/components/social-organization/social-organization-table"
import { canViewSensitivePersonalData, canViewContactData, canViewAddressData, canEditEmployee } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"

const STATUS_COLORS: Record<string, string> = {
  AKTIF: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/20",
  NON_AKTIF: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-500/20",
  CUTI: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/20",
  PENSIUN: "bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300 border-slate-500/20",
}

const STATUS_LABELS: Record<string, string> = {
  AKTIF: "Aktif",
  NON_AKTIF: "Non Aktif",
  CUTI: "Cuti",
  PENSIUN: "Pensiun",
}

const GENDER_LABELS: Record<string, string> = {
  LAKI_LAKI: "Laki-laki",
  PEREMPUAN: "Perempuan",
}

const MARITAL_LABELS: Record<string, string> = {
  BELUM_MENIKAH: "Belum Menikah",
  MENIKAH: "Menikah",
  CERAI_HIDUP: "Cerai Hidup",
  CERAI_MATI: "Cerai Mati",
}

const EDU_LABELS: Record<string, string> = {
  SD: "SD",
  SMP: "SMP",
  SMA_SMK: "SMA / SMK",
  D1: "Diploma 1 (D1)",
  D2: "Diploma 2 (D2)",
  D3: "Diploma 3 (D3)",
  D4: "Diploma 4 (D4)",
  S1: "Sarjana (S1)",
  S2: "Magister (S2)",
  S3: "Doktor (S3)",
}

function DetailRow({
  label,
  value,
  icon: Icon,
  canCopy = false,
}: {
  label: string
  value?: string | number | null
  icon?: React.ElementType
  canCopy?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!value) return
    navigator.clipboard.writeText(String(value))
    setCopied(true)
    toast.success(`${label} disalin ke clipboard`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors gap-1 sm:gap-4 border-b border-border/30 last:border-0 text-sm">
      <span className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />}
        {label}
      </span>
      <div className="flex items-center gap-2 font-medium text-foreground text-sm sm:text-right break-words pl-5 sm:pl-0">
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="text-muted-foreground/40 italic">-</span>
        )}
        {canCopy && value && (
          <button
            onClick={handleCopy}
            className="text-muted-foreground/60 hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
            title={`Salin ${label}`}
          >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          </button>
        )}
      </div>
    </div>
  )
}

export function EmployeeDetailClient({
  employee,
  educations,
  educationHistories,
  occupations,
  children,
  spouses,
  trainings,
  employmentDocuments,
  certifications,
  workUnits,
  healthData,
  socialOrganizations,
}: {
  employee: any
  educations: any[]
  educationHistories: any[]
  occupations: any[]
  children: any[]
  spouses: any[]
  trainings: any[]
  employmentDocuments: any[]
  certifications: any[]
  workUnits: any[]
  healthData: any[]
  socialOrganizations: any[]
}) {
  const { data: session } = useSession()
  const role = session?.user?.role as Role | undefined
  const [activeTab, setActiveTab] = useState("personal")
  const tabsScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const initials = employee.fullName
    ? employee.fullName.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
    : "P"

  // Master definition of all 12 tabs with live badge counts
  const tabItems = [
    { id: "personal", label: "Personal", icon: User, count: undefined },
    { id: "pekerjaan", label: "Kepegawaian", icon: Briefcase, count: undefined },
    { id: "pendidikan", label: "Pendidikan", icon: GraduationCap, count: educationHistories.length },
    { id: "pelatihan", label: "Pelatihan", icon: Award, count: trainings.length },
    { id: "sertifikasi", label: "Sertifikasi", icon: CheckCircle, count: certifications.length },
    { id: "riwayat-kepegawaian", label: "Riwayat SK", icon: ScrollText, count: employmentDocuments.length },
    { id: "unit-kerja-lain", label: "Unit Lain", icon: BuildingIcon, count: workUnits.length },
    { id: "keluarga", label: "Keluarga", icon: UsersIcon, count: spouses.length + children.length },
    { id: "data-kesehatan", label: "Kesehatan", icon: HeartIcon, count: healthData.length },
    { id: "data-organisasi-kemasyarakatan", label: "Organisasi", icon: UsersOrgIcon, count: socialOrganizations.length },
    { id: "dokumen", label: "Dokumen", icon: FileText, count: employee.documents?.length ?? 0 },
    { id: "riwayat", label: "Riwayat", icon: Clock, count: employee.history?.length ?? 0 },
  ]

  // Check scroll position for desktop arrow indicators
  const checkScroll = () => {
    if (tabsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsScrollRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [])

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsScrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240
      tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  // Smooth scroll active tab button into center view
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const el = document.getElementById(`tab-trigger-${value}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Navigation & Action */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/pegawai">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Kembali ke Daftar Pegawai</span>
            <span className="sm:hidden">Kembali</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {session?.user?.employeeId === employee.id && (
            <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs rounded-xl h-8 border-primary/20 text-primary hover:bg-primary/10">
              <Link href="/ganti-password">
                <KeyRound className="h-3.5 w-3.5" />
                <span>Ganti Password</span>
              </Link>
            </Button>
          )}

          {role && canEditEmployee(role) && (
            <Button asChild size="sm" className="gap-2 shadow-sm rounded-xl h-8">
              <Link href={`/pegawai/${employee.id}/edit`}>
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Profil</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Hero Profile Card */}
      <Card className="border border-border/80 shadow-sm overflow-hidden bg-card">
        <div className="h-2 w-full bg-gradient-to-r from-primary/80 via-primary to-emerald-600/70" />
        <CardContent className="p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
            {/* Avatar & Badges */}
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-2 border-background shadow-md ring-2 ring-border/50">
                {employee.profilePhoto && (
                  <AvatarImage src={employee.profilePhoto} alt={employee.fullName} className="object-cover" />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl sm:text-3xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {employee.isBlocked ? (
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-red-500 ring-2 ring-background" title="Diblokir" />
              ) : (
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-background" title="Aktif" />
              )}
            </div>

            {/* Name, Title, and Meta */}
            <div className="flex-1 min-w-0 space-y-3 w-full">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate max-w-full">
                    {employee.fullName}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                  <span className="font-mono text-xs sm:text-sm font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                    NIP: {employee.employeeIdNumber}
                  </span>
                  {employee.position && (
                    <span className="text-xs sm:text-sm font-medium text-foreground/80 flex items-center gap-1">
                      • {employee.position.name}
                    </span>
                  )}
                  {employee.department && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {employee.department.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs font-medium border ${STATUS_COLORS[employee.employmentStatus] ?? "bg-muted text-muted-foreground"}`}
                >
                  {STATUS_LABELS[employee.employmentStatus] ?? employee.employmentStatus}
                </Badge>
                {employee.employmentStatusRef && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {employee.employmentStatusRef.name}
                  </Badge>
                )}
                {employee.isBlocked && (
                  <Badge variant="destructive" className="text-xs">
                    Akun Diblokir
                  </Badge>
                )}
              </div>

              {/* Quick Contact & Date Badges */}
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {role && canViewContactData(role) && employee.email && (
                  <a
                    href={`mailto:${employee.email}`}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    <span className="truncate max-w-[200px]">{employee.email}</span>
                  </a>
                )}
                {role && canViewContactData(role) && employee.phoneNumber && (
                  <a
                    href={`tel:${employee.phoneNumber}`}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    <span>{employee.phoneNumber}</span>
                  </a>
                )}
                {employee.joinDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    <span>TMT: {format(new Date(employee.joinDate), "d MMM yyyy", { locale: id })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs Section */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-5">
        {/* Mobile Quick Dropdown Selector (< sm screens) */}
        <div className="sm:hidden w-full bg-card p-2 rounded-xl border border-border/70 shadow-xs">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5 px-1">
            Pilih Kategori Informasi
          </label>
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full bg-background font-medium h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tabItems.map((tab) => {
                const Icon = tab.icon
                return (
                  <SelectItem key={tab.id} value={tab.id} className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-primary" />
                      <span>{tab.label}</span>
                      {typeof tab.count === "number" && tab.count > 0 && (
                        <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-semibold">
                          {tab.count}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Sleek Horizontal Scrollable Tab Bar */}
        <div className="relative group/track">
          {/* Scroll button Left (Desktop) */}
          {canScrollLeft && (
            <button
              onClick={() => scrollTabs("left")}
              aria-label="Scroll tabs left"
              className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/95 border border-border shadow-md items-center justify-center text-foreground hover:bg-muted transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={tabsScrollRef}
            onScroll={checkScroll}
            className="overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 p-1.5 bg-muted/50 rounded-xl border border-border/50"
          >
            <TabsList className="bg-transparent h-auto p-0 flex gap-1.5 w-max">
              {tabItems.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <TabsTrigger
                    key={tab.id}
                    id={`tab-trigger-${tab.id}`}
                    value={tab.id}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all border ${
                      isActive
                        ? "bg-background text-foreground shadow-xs border-border/80 font-semibold"
                        : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-background/50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
                    <span>{tab.label}</span>
                    {typeof tab.count === "number" && tab.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Scroll button Right (Desktop) */}
          {canScrollRight && (
            <button
              onClick={() => scrollTabs("right")}
              aria-label="Scroll tabs right"
              className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/95 border border-border shadow-md items-center justify-center text-foreground hover:bg-muted transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ----------------- TAB CONTENTS ----------------- */}

        {/* 1. Personal */}
        <TabsContent value="personal" className="space-y-4 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card: Identitas Pribadi */}
            <Card className="border border-border/70 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Identitas Diri & Fisik
                </CardTitle>
                <CardDescription className="text-xs">Data kependudukan dan informasi fisik pegawai</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-0.5">
                {role && canViewSensitivePersonalData(role) && (
                  <DetailRow label="NIK (KTP)" value={employee.nationalIdNumber} canCopy icon={ShieldCheck} />
                )}
                <DetailRow label="Tempat Lahir" value={employee.placeOfBirth} icon={MapPin} />
                <DetailRow
                  label="Tanggal Lahir"
                  value={employee.dateOfBirth ? format(new Date(employee.dateOfBirth), "d MMMM yyyy", { locale: id }) : null}
                  icon={Calendar}
                />
                <DetailRow label="Jenis Kelamin" value={employee.gender ? GENDER_LABELS[employee.gender] : null} />
                <DetailRow label="Status Pernikahan" value={employee.maritalStatus ? MARITAL_LABELS[employee.maritalStatus] : null} />
                <DetailRow label="Agama" value={employee.religion?.name} />
                <DetailRow label="Golongan Darah" value={employee.bloodType?.name} />
                <DetailRow label="Tinggi Badan" value={employee.height ? `${employee.height} cm` : null} />
                <DetailRow label="Berat Badan" value={employee.weight ? `${employee.weight} kg` : null} />
                <DetailRow label="Hobi" value={employee.hobbies} />
              </CardContent>
            </Card>

            {/* Card: Alamat & Domisili */}
            {role && canViewAddressData(role) ? (
              <div className="space-y-4">
                <Card className="border border-border/70 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Alamat Domisili Saat Ini
                    </CardTitle>
                    <CardDescription className="text-xs">Lokasi tempat tinggal aktif pegawai</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 space-y-0.5">
                    <DetailRow label="Alamat Lengkap" value={employee.address} />
                    <DetailRow label="Provinsi" value={employee.province} />
                    <DetailRow label="Kode Pos" value={employee.postalCode} />
                  </CardContent>
                </Card>

                <Card className="border border-border/70 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Alamat Asal (Sesuai KTP)
                    </CardTitle>
                    <CardDescription className="text-xs">Alamat kartu identitas resmi</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 space-y-0.5">
                    <DetailRow label="Alamat KTP" value={employee.secondaryAddress} />
                    <DetailRow label="Provinsi KTP" value={employee.secondaryProvince} />
                    <DetailRow label="Kode Pos KTP" value={employee.secondaryPostalCode} />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border border-border/70 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Alamat</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  Data alamat tidak dapat diakses untuk peran Anda.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* 2. Pekerjaan / Kepegawaian */}
        <TabsContent value="pekerjaan" className="space-y-4 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border/70 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Legalitas & Data Pokok Pegawai
                </CardTitle>
                <CardDescription className="text-xs">Nomor identifikasi resmi dan status kontrak</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-0.5">
                <DetailRow label="Nomor Induk Pegawai (NIP)" value={employee.employeeIdNumber} canCopy icon={CreditCard} />
                <DetailRow label="NUPTK" value={employee.educatorIdNumber} canCopy />
                <DetailRow label="Nomor BPJS" value={employee.bpjsNumber} canCopy />
                <DetailRow label="NPWP" value={employee.taxIdNumber} canCopy />
                <DetailRow label="Unit / Departemen" value={employee.department?.name} />
                <DetailRow label="Jabatan Utama" value={employee.position?.name} />
                <DetailRow label="Status Kepegawaian" value={employee.employmentStatusRef?.name} />
                <DetailRow
                  label="Terhitung Mulai Tanggal (TMT)"
                  value={employee.joinDate ? format(new Date(employee.joinDate), "d MMMM yyyy", { locale: id }) : null}
                  icon={Calendar}
                />
              </CardContent>
            </Card>

            <Card className="border border-border/70 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-primary" />
                  Penempatan, Tugas & Fungsi
                </CardTitle>
                <CardDescription className="text-xs">Uraian penugasan struktural dan fungsional</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-0.5">
                <DetailRow label="Unit Posisi" value={employee.positionUnit} />
                <DetailRow label="Data Posisi" value={employee.positionData} />
                <DetailRow label="Unit Fungsi" value={employee.functionUnit} />
                <DetailRow label="Unit Tugas" value={employee.taskUnit} />
                <DetailRow label="Unit Mengajar" value={employee.teachingUnit} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. Pendidikan */}
        <TabsContent value="pendidikan" className="space-y-4 focus-visible:outline-none">
          {/* Highlight Banner Pendidikan Terakhir */}
          <Card className="border border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shrink-0 mt-0.5">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Pendidikan Terakhir
                      </span>
                      {employee.highestEducation && (
                        <Badge variant="secondary" className="font-semibold text-xs">
                          {EDU_LABELS[employee.highestEducation] ?? employee.highestEducation}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground mt-0.5">
                      {employee.institutionName || "Institusi belum diisi"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {employee.major ? `Jurusan ${employee.major}` : "Jurusan belum ditentukan"}
                      {employee.graduationYear ? ` • Lulus Tahun ${employee.graduationYear}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabel Riwayat Pendidikan */}
          <EducationHistoryTable
            employeeId={employee.id}
            initialData={educationHistories}
            educationOptions={educations}
          />
        </TabsContent>

        {/* 4. Pelatihan */}
        <TabsContent value="pelatihan" className="focus-visible:outline-none">
          <TrainingTable
            employeeId={employee.id}
            initialData={trainings}
          />
        </TabsContent>

        {/* 5. Sertifikasi */}
        <TabsContent value="sertifikasi" className="focus-visible:outline-none">
          <CertificationTable
            employeeId={employee.id}
            initialData={certifications}
          />
        </TabsContent>

        {/* 6. Riwayat Kepegawaian / SK */}
        <TabsContent value="riwayat-kepegawaian" className="focus-visible:outline-none">
          <EmploymentDocumentTable
            employeeId={employee.id}
            initialData={employmentDocuments}
          />
        </TabsContent>

        {/* 7. Unit Kerja Lain */}
        <TabsContent value="unit-kerja-lain" className="focus-visible:outline-none">
          <WorkUnitTable
            employeeId={employee.id}
            initialData={workUnits}
          />
        </TabsContent>

        {/* 8. Keluarga */}
        <TabsContent value="keluarga" className="space-y-5 focus-visible:outline-none">
          <SpouseTable
            employeeId={employee.id}
            initialData={spouses}
            educationOptions={educations}
            occupationOptions={occupations}
          />
          <ChildTable
            employeeId={employee.id}
            initialData={children}
            educationOptions={educations}
            occupationOptions={occupations}
          />
        </TabsContent>

        {/* 9. Data Kesehatan */}
        <TabsContent value="data-kesehatan" className="focus-visible:outline-none">
          <HealthDataTable
            employeeId={employee.id}
            initialData={healthData}
          />
        </TabsContent>

        {/* 10. Data Organisasi Kemasyarakatan */}
        <TabsContent value="data-organisasi-kemasyarakatan" className="focus-visible:outline-none">
          <SocialOrganizationTable
            employeeId={employee.id}
            initialData={socialOrganizations}
          />
        </TabsContent>

        {/* 11. Dokumen Pegawai */}
        <TabsContent value="dokumen" className="focus-visible:outline-none">
          <Card className="border border-border/70 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Berkas & Dokumen Pegawai
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Arsip lampiran dokumen yang diunggah untuk pegawai ini
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-medium text-xs">
                  {employee.documents?.length ?? 0} Berkas
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {!employee.documents || employee.documents.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium">Belum ada dokumen yang diunggah</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Dokumen SK, ijazah, atau sertifikat penting akan tampil di sini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {employee.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3.5 bg-muted/30 hover:bg-muted/60 border border-border/60 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground">{doc.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="font-medium uppercase">{doc.type || "Dokumen"}</span>
                            {doc.uploadedAt && (
                              <span>• {format(new Date(doc.uploadedAt), "d MMM yyyy", { locale: id })}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0"
                      >
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium">
                          <span>Buka</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 12. Riwayat Perubahan Pegawai */}
        <TabsContent value="riwayat" className="focus-visible:outline-none">
          <Card className="border border-border/70 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Log Riwayat Pegawai
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Catatan riwayat perubahan data dan perjalanan karir pegawai
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-medium text-xs">
                  {employee.history?.length ?? 0} Catatan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {!employee.history || employee.history.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Clock className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium">Belum ada catatan riwayat</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {employee.history.map((h: any) => (
                    <div key={h.id} className="relative group">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background group-hover:scale-125 transition-transform" />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {h.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(h.date), "d MMMM yyyy", { locale: id })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90 font-medium pt-0.5">{h.description}</p>
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
