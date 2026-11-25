"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Role } from "@/app/generated/prisma/enums"
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/rbac"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  User,
  FileText,
  Handshake,
  ClipboardCheck,
  Upload,
  Briefcase,
  Settings,
  SlidersHorizontal,
  History,
  Award,
  CheckCircle2,
  Heart,
  GraduationCap,
  Building2,
  Database,
  Calendar,
  LogOut,
  Sun,
  Moon,
  LayoutGrid,
  ChevronRight,
  X,
  ShieldCheck,
  BarChart3,
  BookOpen,
  DropletIcon,
  BadgeCheck,
  Sparkles,
  KeyRound,
  Bell,
  PieChart,
  FileCheck2,
  FilePenLine,
} from "lucide-react"

import {
  UserRoleCategory,
  resolveUserRoleCategory,
  resolveUnitName,
} from "@/lib/role-category"

export {
  type UserRoleCategory,
  resolveUserRoleCategory,
  resolveUnitName,
}

export interface BottomBarItem {
  title: string
  href: string
  icon: React.ElementType
  matchPrefix?: boolean
}

export interface QuickActionCard {
  title: string
  desc: string
  href: string
  icon: React.ElementType
  iconColor: string
  bgColor: string
}

export interface SheetMenuItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
  desc?: string
}

export interface SheetMenuGroup {
  groupTitle: string
  items: SheetMenuItem[]
}

export interface RoleNavigationConfig {
  category: UserRoleCategory
  categoryLabel: string
  roleSubtitle: string
  badgeVariant?: string
  bottomBarItems: BottomBarItem[]
  quickActionCards: QuickActionCard[]
  menuGroups: SheetMenuGroup[]
}


/**
 * Membangun konfigurasi navigasi dinamis berdasarkan role pengguna
 */
export function buildRoleNavigation(
  roleCategory: UserRoleCategory,
  employeeId?: string | null,
  nip?: string | null,
  name?: string | null
): RoleNavigationConfig {
  const profileHref = employeeId ? `/pegawai/${employeeId}` : "/pegawai"

  switch (roleCategory) {
    case "PEGAWAI":
      return {
        category: "PEGAWAI",
        categoryLabel: "Pegawai / Guru",
        roleSubtitle: "Akses Data Mandiri & Kinerja",
        bottomBarItems: [
          { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { title: "Profil Saya", href: profileHref, icon: User },
          { title: "Kesediaan", href: "/kesediaan", icon: Handshake },
          { title: "Dokumen", href: "/data-dokumen-penting", icon: Upload },
        ],
        quickActionCards: [
          {
            title: "Profil Saya",
            desc: "Biodata, data dinas & SK",
            href: profileHref,
            icon: User,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-500/10 border-emerald-500/20",
          },
          {
            title: "Form Kesediaan",
            desc: "Isi kesanggupan mengajar",
            href: "/kesediaan",
            icon: Handshake,
            iconColor: "text-indigo-500",
            bgColor: "bg-indigo-500/10 border-indigo-500/20",
          },
          {
            title: "Dokumen Penting",
            desc: "Arsip KTP, KK, Ijazah & SK",
            href: "/data-dokumen-penting",
            icon: Upload,
            iconColor: "text-amber-500",
            bgColor: "bg-amber-500/10 border-amber-500/20",
          },
          {
            title: "Nilai DP3",
            desc: "Evaluasi kinerja tahunan",
            href: "/dp3",
            icon: ClipboardCheck,
            iconColor: "text-sky-500",
            bgColor: "bg-sky-500/10 border-sky-500/20",
          },
        ],
        menuGroups: [
          {
            groupTitle: "Layanan & Administrasi Mandiri",
            items: [
              { title: "Profil & Biodata Pribadi", href: `${profileHref}?tab=personal`, icon: User, desc: "Data diri, NIP, & unit dinas" },
              { title: "Form Kesediaan Mengajar", href: "/kesediaan", icon: Handshake, badge: "Penting", desc: "Kesanggupan beban kerja & hari" },
              { title: "Upload Dokumen Penting", href: "/data-dokumen-penting", icon: Upload, desc: "Berkas digital kepegawaian" },
              { title: "Koreksi Data Mandiri", href: "/pengajuan-koreksi", icon: FilePenLine, badge: "Baru", desc: "Ajukan perbaikan biodata & kontak" },
              { title: "Hasil Penilaian DP3", href: "/dp3", icon: ClipboardCheck, desc: "Rekap nilai dan catatan pimpinan" },
            ],
          },
          {
            groupTitle: "Riwayat & Portofolio Guru",
            items: [
              { title: "Riwayat Pendidikan", href: `${profileHref}?tab=pendidikan`, icon: GraduationCap, desc: "Ijazah & jenjang akademik" },
              { title: "Pelatihan & Diklat", href: `${profileHref}?tab=pelatihan`, icon: Award, desc: "Sertifikat workshop & pelatihan" },
              { title: "Sertifikasi Pendidik", href: `${profileHref}?tab=sertifikasi`, icon: CheckCircle2, desc: "Serdik & status inpassing" },
              { title: "Unit Kerja Luar", href: `${profileHref}?tab=unit-kerja-lain`, icon: Building2, desc: "Aktivitas tugas di luar yayasan" },
            ],
          },
          {
            groupTitle: "Data Keluarga & Kesehatan",
            items: [
              { title: "Data Keluarga & Pasangan", href: `${profileHref}?tab=keluarga`, icon: Users, desc: "Suami/istri dan anak tanggungan" },
              { title: "Data Kesehatan & BPJS", href: `${profileHref}?tab=data-kesehatan`, icon: Heart, desc: "Faskes & nomor kepesertaan" },
            ],
          },
        ],
      }

    case "HR_PUSAT":
      return {
        category: "HR_PUSAT",
        categoryLabel: "HR / Kepegawaian Pusat",
        roleSubtitle: "Manajemen SDM Yayasan Al Wathoniyah 9",
        bottomBarItems: [
          { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { title: "Pegawai", href: "/pegawai", icon: Users, matchPrefix: true },
          { title: "Riwayat SK", href: "/riwayat-kepegawaian", icon: FileText },
          { title: "Dokumen", href: "/data-dokumen-penting", icon: Upload },
        ],
        quickActionCards: [
          {
            title: "Data Pegawai",
            desc: "Kelola master seluruh SDM",
            href: "/pegawai",
            icon: Users,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-500/10 border-blue-500/20",
          },
          {
            title: "Riwayat SK & TMT",
            desc: "Penerbitan SK & mutasi",
            href: "/riwayat-kepegawaian",
            icon: FileText,
            iconColor: "text-violet-500",
            bgColor: "bg-violet-500/10 border-violet-500/20",
          },
          {
            title: "Verifikasi Berkas",
            desc: "Validasi dokumen penting",
            href: "/data-dokumen-penting",
            icon: Upload,
            iconColor: "text-amber-500",
            bgColor: "bg-amber-500/10 border-amber-500/20",
          },
          {
            title: "Monitoring DP3",
            desc: "Pantau DP3 semua unit",
            href: "/dp3",
            icon: ClipboardCheck,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-500/10 border-emerald-500/20",
          },
        ],
        menuGroups: [
          {
            groupTitle: "Manajemen SDM Sentral",
            items: [
              { title: "Data Seluruh Pegawai", href: "/pegawai", icon: Users, desc: "Pencarian, tambah & verifikasi profil" },
              { title: "Riwayat Kepegawaian & SK", href: "/riwayat-kepegawaian", icon: FileText, desc: "Penerbitan SK, kenaikan & mutasi" },
              { title: "Dokumen Penting Pegawai", href: "/data-dokumen-penting", icon: Upload, desc: "Arsip berkas digital seluruh staf" },
              { title: "Rekap Kelengkapan Berkas", href: "/rekap-berkas", icon: FileCheck2, badge: "Baru", desc: "Matriks checklist & export Excel berkas" },
              { title: "Koreksi Data Mandiri", href: "/pengajuan-koreksi", icon: FilePenLine, desc: "Review & setujui koreksi data pegawai" },
              { title: "Monitoring Penilaian DP3", href: "/dp3", icon: ClipboardCheck, desc: "Rekapitulasi penilaian kinerja staf" },
              { title: "Form Kesediaan Mengajar", href: "/kesediaan", icon: Handshake, desc: "Pantau kesiapan formasi guru" },
            ],
          },
          {
            groupTitle: "Laporan & Kualifikasi Staf",
            items: [
              { title: "Laporan Jabatan Pegawai", href: "/laporan/jabatan", icon: BarChart3, badge: "Laporan", desc: "Distribusi formasi & kebutuhan SDM" },
              { title: "Riwayat Pendidikan", href: "/riwayat-pendidikan", icon: GraduationCap, desc: "Peta kualifikasi jenjang studi" },
              { title: "Data Pelatihan & Diklat", href: "/pelatihan", icon: Award, desc: "Rekap workshop kepegawaian" },
              { title: "Sertifikasi & Inpassing", href: "/sertifikasi", icon: CheckCircle2, desc: "Data serdik tenaga pendidik" },
              { title: "Data Keluarga Pegawai", href: "/data-keluarga", icon: Users, desc: "Tanggungan keluarga staf" },
              { title: "Data Kesehatan & BPJS", href: "/data-kesehatan", icon: Heart, desc: "Faskes & rekap BPJS" },
              { title: "Unit Kerja Luar", href: "/unit-kerja-lain", icon: Building2, desc: "Aktivitas kerja di luar yayasan" },
              { title: "Org. Kemasyarakatan", href: "/data-organisasi-kemasyarakatan", icon: Users, desc: "Data organisasi sosial pegawai" },
            ],
          },
          {
            groupTitle: "Master Data & Pengaturan",
            items: [
              { title: "Master Departemen / Unit", href: "/master/departemen", icon: Building2, desc: "Struktur unit sekolah & yayasan" },
              { title: "Master Jabatan", href: "/master/jabatan", icon: Briefcase, desc: "Jabatan struktural & fungsional" },
              { title: "Master Mata Pelajaran", href: "/master/mata-pelajaran", icon: BookOpen, desc: "Daftar mapel kurikulum" },
              { title: "Master Status Pegawai", href: "/master/status-kepegawaian", icon: BadgeCheck, desc: "Status tetap, kontrak, honorer" },
              { title: "Pengaturan SIMKA", href: "/pengaturan", icon: SlidersHorizontal, desc: "Konfigurasi instansi & branding" },
              { title: "Log Aktivitas Sistem", href: "/log-aktivitas", icon: FileText, desc: "Audit trail perubahan data" },
              { title: "Analitik HR", href: "/analitik", icon: PieChart, badge: "Baru", desc: "Dashboard statistik & distribusi SDM" },
              { title: "Notifikasi", href: "/notifikasi", icon: Bell, desc: "Pusat pemberitahuan sistem" },
            ],
          },
        ],
      }

    case "ADMIN_UNIT": {
      const unitLabel = resolveUnitName(nip, name)
      return {
        category: "ADMIN_UNIT",
        categoryLabel: unitLabel,
        roleSubtitle: "Administrasi Kepegawaian Unit Sekolah",
        bottomBarItems: [
          { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { title: "Pegawai Unit", href: "/pegawai", icon: Users, matchPrefix: true },
          { title: "Kesediaan", href: "/kesediaan", icon: Handshake },
          { title: "DP3 Unit", href: "/dp3", icon: ClipboardCheck },
        ],
        quickActionCards: [
          {
            title: "Pegawai Unit",
            desc: "Data guru & staf sekolah",
            href: "/pegawai",
            icon: Users,
            iconColor: "text-cyan-500",
            bgColor: "bg-cyan-500/10 border-cyan-500/20",
          },
          {
            title: "Kesediaan Guru",
            desc: "Pantau kesiapan mengajar",
            href: "/kesediaan",
            icon: Handshake,
            iconColor: "text-indigo-500",
            bgColor: "bg-indigo-500/10 border-indigo-500/20",
          },
          {
            title: "Dokumen Guru",
            desc: "Kelengkapan berkas fisik",
            href: "/data-dokumen-penting",
            icon: Upload,
            iconColor: "text-amber-500",
            bgColor: "bg-amber-500/10 border-amber-500/20",
          },
          {
            title: "DP3 Unit",
            desc: "Bantu input & rekap DP3",
            href: "/dp3",
            icon: ClipboardCheck,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-500/10 border-emerald-500/20",
          },
        ],
        menuGroups: [
          {
            groupTitle: "Operasional Kepegawaian Unit",
            items: [
              { title: `Daftar Staf ${unitLabel}`, href: "/pegawai", icon: Users, desc: "Profil & direktori pegawai unit" },
              { title: "Form Kesediaan Guru Unit", href: "/kesediaan", icon: Handshake, badge: "Penting", desc: "Pantau pengisian kesediaan mengajar" },
              { title: "Dokumen & Berkas Unit", href: "/data-dokumen-penting", icon: Upload, desc: "Pemeriksaan berkas guru sekolah" },
              { title: "Rekap Kelengkapan Berkas", href: "/rekap-berkas", icon: FileCheck2, desc: "Checklist kelengkapan berkas unit" },
              { title: "Koreksi Data Unit", href: "/pengajuan-koreksi", icon: FilePenLine, desc: "Review koreksi data pegawai unit" },
              { title: "Penilaian DP3 Unit", href: "/dp3", icon: ClipboardCheck, desc: "Persiapan penilaian kinerja staf unit" },
              { title: "Laporan Jabatan Unit", href: "/laporan/jabatan", icon: BarChart3, desc: "Distribusi tugas & jabatan unit" },
            ],
          },
          {
            groupTitle: "Kelengkapan Guru & Tenaga Kependidikan",
            items: [
              { title: "Riwayat Pendidikan Guru", href: "/riwayat-pendidikan", icon: GraduationCap, desc: "Linearitas ijazah tenaga pendidik" },
              { title: "Sertifikasi Guru & Inpassing", href: "/sertifikasi", icon: CheckCircle2, desc: "Status serdik guru unit" },
              { title: "Pelatihan & Workshop Unit", href: "/pelatihan", icon: Award, desc: "Pengembangan kompetensi guru" },
              { title: "Data Keluarga Staf", href: "/data-keluarga", icon: Users, desc: "Data keluarga pendukung tunjangan" },
              { title: "Data Kesehatan & BPJS", href: "/data-kesehatan", icon: Heart, desc: "Info kepesertaan jaminan kesehatan" },
            ],
          },
        ],
      }
    }

    case "PIMPINAN":
      return {
        category: "PIMPINAN",
        categoryLabel: "Pimpinan / Kepala Sekolah",
        roleSubtitle: "Evaluasi Kinerja, Pengawasan & Pengambilan Keputusan",
        bottomBarItems: [
          { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { title: "Penilaian DP3", href: "/dp3", icon: ClipboardCheck },
          { title: "Pegawai", href: "/pegawai", icon: Users, matchPrefix: true },
          { title: "Kesediaan", href: "/kesediaan", icon: Handshake },
        ],
        quickActionCards: [
          {
            title: "Penilaian DP3",
            desc: "Evaluasi & nilai kinerja staf",
            href: "/dp3",
            icon: ClipboardCheck,
            iconColor: "text-purple-500",
            bgColor: "bg-purple-500/10 border-purple-500/20",
          },
          {
            title: "Data & Profil Staf",
            desc: "Tinjau kinerja & profil staf",
            href: "/pegawai",
            icon: Users,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-500/10 border-blue-500/20",
          },
          {
            title: "Tinjau Kesediaan",
            desc: "Cek jadwal & kesiapan guru",
            href: "/kesediaan",
            icon: Handshake,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-500/10 border-emerald-500/20",
          },
          {
            title: "Laporan Jabatan",
            desc: "Analisis formasi & rasio SDM",
            href: "/laporan/jabatan",
            icon: BarChart3,
            iconColor: "text-amber-500",
            bgColor: "bg-amber-500/10 border-amber-500/20",
          },
        ],
        menuGroups: [
          {
            groupTitle: "Fungsi Evaluasi & Supervisi",
            items: [
              { title: "Penilaian Kinerja DP3", href: "/dp3", icon: ClipboardCheck, badge: "Utama", desc: "Input evaluasi tahunan staf binaan" },
              { title: "Rekap Form Kesediaan Guru", href: "/kesediaan", icon: Handshake, desc: "Kesiapan beban mengajar semester depan" },
              { title: "Direktori Pegawai Binaan", href: "/pegawai", icon: Users, desc: "Data komprehensif seluruh bawahan" },
              { title: "Laporan Distribusi Jabatan", href: "/laporan/jabatan", icon: BarChart3, desc: "Evaluasi kecukupan guru & staf" },
            ],
          },
          {
            groupTitle: "Portofolio & Kualifikasi Bawahan",
            items: [
              { title: "Arsip Dokumen Penting", href: "/data-dokumen-penting", icon: Upload, desc: "Validasi berkas & sertifikat staf" },
              { title: "Kualifikasi Akademik Staf", href: "/riwayat-pendidikan", icon: GraduationCap, desc: "Peta pendidikan tenaga pendidik" },
              { title: "Sertifikasi Guru & Inpassing", href: "/sertifikasi", icon: CheckCircle2, desc: "Kualifikasi sertifikasi pengajar" },
              { title: "Pelatihan & Workshop Staf", href: "/pelatihan", icon: Award, desc: "Riwayat diklat & pengembangan diri" },
              { title: "Aktivitas Unit Luar", href: "/unit-kerja-lain", icon: Building2, desc: "Penugasan atau kerja di unit lain" },
            ],
          },
        ],
      }

    case "SUPER_ADMIN":
      return {
        category: "SUPER_ADMIN",
        categoryLabel: "Super Administrator",
        roleSubtitle: "Kontrol Penuh Sistem & Konfigurasi SIMKA",
        bottomBarItems: [
          { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { title: "Manajemen Akun", href: "/akun", icon: Settings },
          { title: "Pegawai", href: "/pegawai", icon: Users, matchPrefix: true },
          { title: "Master", href: "/master/departemen", icon: Database },
        ],
        quickActionCards: [
          {
            title: "Manajemen Akun",
            desc: "User, password & hak akses",
            href: "/akun",
            icon: Settings,
            iconColor: "text-rose-500",
            bgColor: "bg-rose-500/10 border-rose-500/20",
          },
          {
            title: "Master Pegawai",
            desc: "Akses CRUD seluruh data SDM",
            href: "/pegawai",
            icon: Users,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-500/10 border-blue-500/20",
          },
          {
            title: "Pengaturan Sistem",
            desc: "Logo, instansi, branding",
            href: "/pengaturan",
            icon: SlidersHorizontal,
            iconColor: "text-violet-500",
            bgColor: "bg-violet-500/10 border-violet-500/20",
          },
          {
            title: "Log Aktivitas",
            desc: "Audit trail & riwayat sistem",
            href: "/log-aktivitas",
            icon: FileText,
            iconColor: "text-amber-500",
            bgColor: "bg-amber-500/10 border-amber-500/20",
          },
        ],
        menuGroups: [
          {
            groupTitle: "Administrasi & Keamanan Sistem",
            items: [
              { title: "Manajemen Akun Pengguna", href: "/akun", icon: Settings, badge: "Admin", desc: "Kelola user, reset password & role" },
              { title: "Log Aktivitas & Audit Trail", href: "/log-aktivitas", icon: FileText, desc: "Riwayat login, edit, & hapus data" },
              { title: "Pengaturan SIMKA & Branding", href: "/pengaturan", icon: SlidersHorizontal, desc: "Konfigurasi nama, logo & tahun ajaran" },
              { title: "Analitik HR", href: "/analitik", icon: PieChart, desc: "Dashboard statistik & distribusi SDM" },
              { title: "Notifikasi", href: "/notifikasi", icon: Bell, desc: "Pusat pemberitahuan sistem" },
            ],
          },
          {
            groupTitle: "Master Data Yayasan",
            items: [
              { title: "Master Departemen / Unit", href: "/master/departemen", icon: Building2, desc: "Daftar sekolah & divisi yayasan" },
              { title: "Master Jabatan Pegawai", href: "/master/jabatan", icon: Briefcase, desc: "Klasifikasi jabatan & hierarki" },
              { title: "Master Mata Pelajaran", href: "/master/mata-pelajaran", icon: BookOpen, desc: "Referensi mata pelajaran" },
              { title: "Master Status Kepegawaian", href: "/master/status-kepegawaian", icon: BadgeCheck, desc: "Tetap, Kontrak, Honorer" },
              { title: "Master Tahun Ajaran", href: "/master/tahun", icon: Calendar, desc: "Setting periode & semester" },
              { title: "Master Pendidikan & Agama", href: "/master/pendidikan", icon: GraduationCap, desc: "Tabel referensi umum" },
            ],
          },
          {
            groupTitle: "Modul Transaksi & Layanan",
            items: [
              { title: "Data Seluruh Pegawai", href: "/pegawai", icon: Users, desc: "Direktori & manipulasi data staf" },
              { title: "Penilaian DP3", href: "/dp3", icon: ClipboardCheck, desc: "Rekap & override nilai DP3" },
              { title: "Form Kesediaan Mengajar", href: "/kesediaan", icon: Handshake, desc: "Data kesediaan mengajar staf" },
              { title: "Dokumen Penting Pegawai", href: "/data-dokumen-penting", icon: Upload, desc: "Arsip berkas terpusat" },
              { title: "Rekap Kelengkapan Berkas", href: "/rekap-berkas", icon: FileCheck2, desc: "Checklist kelengkapan & export Excel" },
              { title: "Koreksi Data Mandiri", href: "/pengajuan-koreksi", icon: FilePenLine, desc: "Review pengajuan koreksi data" },
              { title: "Laporan Jabatan Pegawai", href: "/laporan/jabatan", icon: BarChart3, desc: "Rekapitulasi SDM yayasan" },
              { title: "Riwayat Kepegawaian", href: "/riwayat-kepegawaian", icon: FileText, desc: "SK & catatan riwayat dinas" },
            ],
          },
        ],
      }

    case "PEMILIK_YAYASAN":
      return {
        category: "PEMILIK_YAYASAN",
        categoryLabel: roleCategory === "PEMILIK_YAYASAN" ? "Pemilik Yayasan" : "Pimpinan Yayasan",
        roleSubtitle: "Pengawasan Strategis & Otorisasi Kinerja SDM",
        bottomBarItems: [
          { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { title: "Approval DP3", href: "/dp3", icon: ClipboardCheck },
          { title: "Pegawai", href: "/pegawai", icon: Users, matchPrefix: true },
          { title: "Laporan", href: "/laporan/jabatan", icon: BarChart3 },
        ],
        quickActionCards: [
          {
            title: "Approval DP3",
            desc: "Persetujuan akhir nilai kinerja",
            href: "/dp3",
            icon: ClipboardCheck,
            iconColor: "text-amber-500",
            bgColor: "bg-amber-500/10 border-amber-500/20",
          },
          {
            title: "Dashboard Eksekutif",
            desc: "Statistik makro SDM yayasan",
            href: "/dashboard",
            icon: LayoutDashboard,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-500/10 border-blue-500/20",
          },
          {
            title: "Laporan Jabatan",
            desc: "Analisis formasi & kebutuhan",
            href: "/laporan/jabatan",
            icon: BarChart3,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-500/10 border-emerald-500/20",
          },
          {
            title: "Direktori Pegawai",
            desc: "Tinjauan eksekutif profil guru",
            href: "/pegawai",
            icon: Users,
            iconColor: "text-purple-500",
            bgColor: "bg-purple-500/10 border-purple-500/20",
          },
        ],
        menuGroups: [
          {
            groupTitle: "Otorisasi & Kebijakan Strategis",
            items: [
              { title: "Persetujuan Akhir DP3", href: "/dp3", icon: ClipboardCheck, badge: "Approval", desc: "Otorisasi hasil evaluasi kinerja seluruh staf" },
              { title: "Dashboard Eksekutif Yayasan", href: "/dashboard", icon: LayoutDashboard, desc: "Ringkasan metrik statistik SDM" },
              { title: "Laporan Distribusi Jabatan", href: "/laporan/jabatan", icon: BarChart3, desc: "Formasi guru & tenaga kependidikan" },
            ],
          },
          {
            groupTitle: "Tinjauan Kepegawaian Yayasan",
            items: [
              { title: "Direktori Seluruh Pegawai", href: "/pegawai", icon: Users, desc: "Profil eksekutif staf & tenaga pendidik" },
              { title: "Dokumen Penting Pegawai", href: "/data-dokumen-penting", icon: Upload, desc: "Arsip berkas legalitas yayasan" },
              { title: "Riwayat Kepegawaian & SK", href: "/riwayat-kepegawaian", icon: FileText, desc: "Arsip SK pengangkatan & mutasi" },
            ],
          },
        ],
      }
  }
}

interface MobileBottomNavProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MobileBottomNav({ open: controlledOpen, onOpenChange }: MobileBottomNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isSheetOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setIsSheetOpen = onOpenChange || setUncontrolledOpen

  const user = session?.user as { name?: string | null; role?: Role; nip?: string | null; employeeId?: string | null; departmentId?: string | null } | undefined
  const role = user?.role
  const nip = user?.nip
  const userName = user?.name || "Pengguna"
  const employeeId = user?.employeeId
  const departmentId = user?.departmentId

  const roleCategory = useMemo(() => {
    return resolveUserRoleCategory(role, nip, userName, departmentId)
  }, [role, nip, userName, departmentId])

  const navConfig = useMemo(() => {
    return buildRoleNavigation(roleCategory, employeeId, nip, userName)
  }, [roleCategory, employeeId, nip, userName])

  // Tutup sheet secara otomatis setiap kali rute berpindah
  useEffect(() => {
    setIsSheetOpen(false)
  }, [pathname, setIsSheetOpen])

  const initials = userName
    ? userName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  const roleBadgeColor = role
    ? ROLE_COLORS[role] || "bg-primary/10 text-primary border-primary/20"
    : "bg-muted text-muted-foreground"

  const isCurrentActive = (href: string, matchPrefix = false) => {
    const [hrefPath, hrefQuery] = href.split("?")
    if (hrefPath === "/dashboard") return pathname === "/dashboard"
    if (hrefQuery) {
      if (typeof window === "undefined") return false
      const currentQuery = window.location.search.replace(/^\?/, "")
      return pathname === hrefPath && currentQuery === hrefQuery
    }
    if (matchPrefix) return pathname === hrefPath || pathname.startsWith(hrefPath + "/")
    return pathname === hrefPath
  }

  return (
    <>
      {/* ======================================================== */}
      {/* 1. FIXED BOTTOM BAR (Thumb-friendly 4 Quick Items + Menu) */}
      {/* ======================================================== */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe transition-all"
      >
        <div className="flex items-center justify-around h-16 px-1.5 max-w-lg mx-auto">
          {navConfig.bottomBarItems.map((item) => {
            const Icon = item.icon
            const active = isCurrentActive(item.href, item.matchPrefix)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 group relative min-w-0",
                  active
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active Indicator Pill */}
                {active && (
                  <span className="absolute top-1 w-6 h-1 bg-primary rounded-full animate-in fade-in zoom-in-50 duration-200" />
                )}
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-colors",
                    active ? "bg-primary/10 text-primary" : "group-hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5 tracking-tight max-w-[68px]">
                  {item.title}
                </span>
              </Link>
            )
          })}

          {/* Tombol ke-5: Trigger Menu Bottom Sheet */}
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            aria-label="Buka Semua Menu"
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 group relative min-w-0",
              isSheetOpen
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isSheetOpen && (
              <span className="absolute top-1 w-6 h-1 bg-primary rounded-full animate-in fade-in duration-200" />
            )}
            <div
              className={cn(
                "p-1.5 rounded-xl transition-colors",
                isSheetOpen ? "bg-primary/10 text-primary" : "group-hover:bg-muted"
              )}
            >
              <LayoutGrid className="h-5 w-5 flex-shrink-0" />
            </div>
            <span className="text-[10px] leading-tight truncate mt-0.5 tracking-tight font-medium">
              Menu
            </span>
          </button>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 2. MENU BOTTOM SHEET (Sesuai Role Pengguna) */}
      {/* ======================================================== */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="p-0 border-t border-border bg-card max-h-[88vh] rounded-t-[28px] shadow-2xl flex flex-col focus:outline-none"
        >
          {/* Header Aksesibilitas */}
          <SheetHeader className="sr-only">
            <SheetTitle>Menu Navigasi {navConfig.categoryLabel}</SheetTitle>
          </SheetHeader>

          {/* Grab Handle Bar (Thumb-Pull Friendly) */}
          <div className="pt-3 pb-1 flex justify-center flex-shrink-0 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50 rounded-full transition-colors" />
          </div>

          {/* Header Profil Pengguna & Role Info */}
          <div className="px-5 py-3 border-b border-border/70 flex items-center justify-between flex-shrink-0 bg-muted/20">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-11 w-11 border-2 border-background shadow-xs flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-bold text-sm text-foreground truncate max-w-[180px] sm:max-w-[240px]">
                    {userName}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border border-current/20 inline-block truncate max-w-[190px]",
                      roleBadgeColor
                    )}
                  >
                    {navConfig.categoryLabel}
                  </span>
                  {nip && (
                    <span className="text-[10px] text-muted-foreground font-mono truncate">
                      {nip}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Tutup Sheet */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsSheetOpen(false)}
              className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 flex-shrink-0"
              aria-label="Tutup Menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Konten Scrollable Sheet Menu */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 no-scrollbar">
            {/* 1. Quick Action Cards Grid (Aksi Utama Thumb-Accessible) */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Aksi Cepat & Paling Sering
                </p>
                <span className="text-[10px] text-muted-foreground">Rekomendasi Role</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {navConfig.quickActionCards.map((card) => {
                  const CardIcon = card.icon
                  const active = isCurrentActive(card.href)

                  return (
                    <Link
                      key={card.title}
                      href={card.href}
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        "p-3 rounded-2xl border transition-all duration-200 active:scale-[0.97] flex flex-col gap-2 group",
                        active
                          ? "border-primary bg-primary/5 shadow-xs"
                          : cn("hover:border-border/90 hover:bg-muted/40", card.bgColor)
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs",
                            "bg-background/80",
                            card.iconColor
                          )}
                        >
                          <CardIcon className="h-4 w-4" />
                        </div>
                        {active && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                          {card.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                          {card.desc}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* 2. Menu Groups Dinamis Sesuai Role */}
            {navConfig.menuGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  {group.groupTitle}
                </p>
                <div className="rounded-2xl border border-border/70 bg-card divide-y divide-border/60 overflow-hidden shadow-2xs">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon
                    const active = isCurrentActive(item.href)

                    return (
                      <Link
                        key={item.title + item.href}
                        href={item.href}
                        onClick={() => setIsSheetOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-3 transition-colors active:bg-muted/80 group",
                          active
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted/40 text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/70 text-muted-foreground group-hover:text-foreground group-hover:bg-muted"
                            )}
                          >
                            <ItemIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn("text-xs font-semibold truncate", active ? "text-primary" : "text-foreground")}>
                                {item.title}
                              </p>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] px-1.5 py-0 font-bold h-4 bg-primary/15 text-primary border-transparent"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            {item.desc && (
                              <p className="text-[10px] text-muted-foreground truncate">
                                {item.desc}
                              </p>
                            )}
                          </div>
                        </div>

                        <ChevronRight
                          className={cn(
                            "h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5",
                            active ? "text-primary" : "text-muted-foreground/60"
                          )}
                        />
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* 3. Utilitas Tambahan (Tema, Ganti Password, Profil, Logout) */}
            <div className="pt-2 border-t border-border/70 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {/* Ganti Tema Tampilan */}
                <button
                  type="button"
                  onClick={() => {
                    const current = resolvedTheme || theme
                    setTheme(current === "dark" ? "light" : "dark")
                  }}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 text-[11px] font-medium text-foreground transition active:scale-95 text-center"
                >
                  {mounted && (resolvedTheme === "dark" || theme === "dark") ? (
                    <>
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span>Terang</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-indigo-500" />
                      <span>Gelap</span>
                    </>
                  )}
                </button>

                {/* Ganti Password */}
                <Link
                  href="/ganti-password"
                  onClick={() => setIsSheetOpen(false)}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 text-[11px] font-medium text-foreground transition active:scale-95 text-center"
                >
                  <KeyRound className="h-4 w-4 text-primary" />
                  <span>Password</span>
                </Link>

                {/* Profil / Akun Pengguna */}
                <Link
                  href={employeeId ? `/pegawai/${employeeId}` : "/dashboard"}
                  onClick={() => setIsSheetOpen(false)}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 text-[11px] font-medium text-foreground transition active:scale-95 text-center"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Profil</span>
                </Link>
              </div>

              {/* Tombol Logout */}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/15 text-destructive text-xs font-bold transition active:scale-98"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar dari SIMKA (Logout)</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
