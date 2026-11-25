"use client"

import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

interface CvPrintClientProps {
  employee: {
    id: string
    employeeIdNumber: string
    nationalIdNumber: string | null
    educatorIdNumber: string | null
    bpjsNumber: string | null
    taxIdNumber: string | null
    fullName: string
    profilePhoto: string | null
    placeOfBirth: string | null
    dateOfBirth: Date | string | null
    gender: string | null
    maritalStatus: string | null
    employmentStatus: string
    address: string | null
    province: string | null
    postalCode: string | null
    email: string | null
    phoneNumber: string | null
    joinDate: Date | string | null
    highestEducation: string | null
    major: string | null
    institutionName: string | null
    graduationYear: number | null
    department: { name: string } | null
    position: { name: string } | null
    religion: { name: string } | null
    bloodType: { name: string } | null
    employmentStatusRef: { name: string } | null
    subject: { name: string } | null
    educationHistories: Array<{
      id: string
      institutionName: string | null
      major: string | null
      graduationYear: number | null
      gpa: number | null
      education: { name: string }
    }>
    employmentDocuments: Array<{
      id: string
      letterName: string
      date: Date | string | null
      number: string | null
      description: string | null
    }>
    trainings: Array<{
      id: string
      name: string
      type: string
      organizerLocation: string | null
      date: Date | string | null
      certificateNumber: string | null
    }>
    certifications: Array<{
      id: string
      isCertifiedTeacher: boolean
      certificationBaseSchool: string | null
      educationCertificateNumber: string | null
      certificationYear: number | null
      inpassingSkNumber: string | null
      inpassingSkYear: number | null
    }>
    workUnits: Array<{
      id: string
      worksElsewhere: boolean
      workplaceName: string | null
      position: string | null
      status: string | null
    }>
    socialOrganizations: Array<{
      id: string
      organizationName: string | null
      position: string | null
      joinDate: Date | string | null
    }>
  }
  appConfig: {
    appName: string
    appOwner: string | null
    logoUrl: string | null
    address: string | null
    phone: string | null
    email: string | null
    website: string | null
  } | null
}

const GENDER_LABEL: Record<string, string> = {
  LAKI_LAKI: "Laki-laki",
  PEREMPUAN: "Perempuan",
}

const MARITAL_LABEL: Record<string, string> = {
  BELUM_MENIKAH: "Belum Menikah",
  MENIKAH: "Menikah",
  CERAI_HIDUP: "Cerai Hidup",
  CERAI_MATI: "Cerai Mati",
}

function fmtDate(val: Date | string | null | undefined): string {
  if (!val) return "-"
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return "-"
  return format(d, "dd MMMM yyyy", { locale: localeId })
}

export function CvPrintClient({ employee, appConfig }: CvPrintClientProps) {
  const initials = employee.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const orgTitle = appConfig?.appOwner || appConfig?.appName || "SIMKA9"

  return (
    <div className="max-w-4xl mx-auto pb-12 print:max-w-none print:pb-0">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 14mm;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }
        }
      `}</style>

      {/* Toolbar Aksi (disembunyikan saat print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/pegawai/${employee.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Profil Pegawai
          </Link>
        </Button>

        <Button onClick={() => window.print()} size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Cetak / Simpan PDF
        </Button>
      </div>

      {/* Lembar CV A4 */}
      <div className="bg-white text-slate-900 rounded-xl border shadow-sm p-6 sm:p-10 print:border-0 print:shadow-none print:p-0 print:rounded-none space-y-6">
        {/* Kop Surat Yayasan / Instansi */}
        <header className="flex items-center gap-4 border-b-2 border-slate-800 pb-4">
          {appConfig?.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={appConfig.logoUrl}
              alt={orgTitle}
              className="h-16 w-16 object-contain flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-slate-900">
              {orgTitle}
            </h1>
            {appConfig?.address && (
              <p className="text-xs text-slate-600 mt-0.5">{appConfig.address}</p>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-600 mt-0.5">
              {appConfig?.phone && <span>Telp: {appConfig.phone}</span>}
              {appConfig?.email && <span>Email: {appConfig.email}</span>}
              {appConfig?.website && <span>Web: {appConfig.website}</span>}
            </div>
          </div>
          <div className="text-right hidden sm:block print:block">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 border border-slate-300 rounded text-slate-700">
              Daftar Riwayat Hidup
            </span>
          </div>
        </header>

        {/* Identitas Utama + Foto */}
        <section className="flex flex-col sm:flex-row print:flex-row gap-5 items-start">
          <div className="h-32 w-26 rounded-lg border border-slate-300 overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
            {employee.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={employee.profilePhoto}
                alt={employee.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-slate-500">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{employee.fullName}</h2>
              <p className="text-sm font-medium text-slate-700">
                {employee.position?.name ?? "Staf / Pegawai"}{" "}
                {employee.department ? `· ${employee.department.name}` : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-6 gap-y-1 text-xs pt-1">
              <div>
                <span className="text-slate-500">NIP:</span>{" "}
                <span className="font-mono font-semibold">{employee.employeeIdNumber}</span>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>{" "}
                <span className="font-medium">
                  {employee.employmentStatusRef?.name ?? employee.employmentStatus}
                </span>
              </div>
              <div>
                <span className="text-slate-500">NUPTK:</span>{" "}
                <span className="font-medium">{employee.educatorIdNumber || "-"}</span>
              </div>
              <div>
                <span className="text-slate-500">Tgl Bergabung:</span>{" "}
                <span className="font-medium">{fmtDate(employee.joinDate)}</span>
              </div>
              {employee.subject && (
                <div className="sm:col-span-2 print:col-span-2">
                  <span className="text-slate-500">Mata Pelajaran:</span>{" "}
                  <span className="font-medium">{employee.subject.name}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Data Pribadi */}
        <section className="space-y-2 break-inside-avoid">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
            I. Data Pribadi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
            <div className="flex justify-between gap-2 border-b border-slate-100 py-1">
              <span className="text-slate-500">Tempat, Tanggal Lahir</span>
              <span className="font-medium text-right">
                {employee.placeOfBirth || "-"}, {fmtDate(employee.dateOfBirth)}
              </span>
            </div>
            <div className="flex justify-between gap-2 border-b border-slate-100 py-1">
              <span className="text-slate-500">Jenis Kelamin</span>
              <span className="font-medium text-right">
                {employee.gender ? GENDER_LABEL[employee.gender] ?? employee.gender : "-"}
              </span>
            </div>
            <div className="flex justify-between gap-2 border-b border-slate-100 py-1">
              <span className="text-slate-500">Agama</span>
              <span className="font-medium text-right">{employee.religion?.name ?? "-"}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-slate-100 py-1">
              <span className="text-slate-500">Status Pernikahan</span>
              <span className="font-medium text-right">
                {employee.maritalStatus
                  ? MARITAL_LABEL[employee.maritalStatus] ?? employee.maritalStatus
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between gap-2 border-b border-slate-100 py-1">
              <span className="text-slate-500">Golongan Darah</span>
              <span className="font-medium text-right">{employee.bloodType?.name ?? "-"}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-slate-100 py-1">
              <span className="text-slate-500">No. Telepon / HP</span>
              <span className="font-medium text-right">{employee.phoneNumber || "-"}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-slate-100 py-1">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-right">{employee.email || "-"}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-slate-100 py-1">
              <span className="text-slate-500">NIK / BPJS / NPWP</span>
              <span className="font-medium text-right">
                {employee.nationalIdNumber || "-"} / {employee.bpjsNumber || "-"} /{" "}
                {employee.taxIdNumber || "-"}
              </span>
            </div>
            <div className="sm:col-span-2 print:col-span-2 flex justify-between gap-4 border-b border-slate-100 py-1">
              <span className="text-slate-500 flex-shrink-0">Alamat</span>
              <span className="font-medium text-right">
                {[employee.address, employee.province, employee.postalCode]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </span>
            </div>
          </div>
        </section>

        {/* Riwayat Pendidikan */}
        <section className="space-y-2 break-inside-avoid">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
            II. Riwayat Pendidikan
          </h3>
          {employee.educationHistories.length === 0 ? (
            <p className="text-xs text-slate-500">
              {employee.highestEducation
                ? `${employee.highestEducation}${employee.major ? ` - ${employee.major}` : ""}${
                    employee.institutionName ? ` (${employee.institutionName})` : ""
                  }${employee.graduationYear ? `, Lulus ${employee.graduationYear}` : ""}`
                : "Belum ada riwayat pendidikan tercatat."}
            </p>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="text-left p-1.5 border border-slate-200">Jenjang</th>
                  <th className="text-left p-1.5 border border-slate-200">Institusi</th>
                  <th className="text-left p-1.5 border border-slate-200">Jurusan / Prodi</th>
                  <th className="text-center p-1.5 border border-slate-200">Tahun Lulus</th>
                </tr>
              </thead>
              <tbody>
                {employee.educationHistories.map((edu) => (
                  <tr key={edu.id}>
                    <td className="p-1.5 border border-slate-200 font-medium">{edu.education.name}</td>
                    <td className="p-1.5 border border-slate-200">{edu.institutionName || "-"}</td>
                    <td className="p-1.5 border border-slate-200">{edu.major || "-"}</td>
                    <td className="p-1.5 border border-slate-200 text-center">
                      {edu.graduationYear ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Riwayat Kepegawaian / SK */}
        {employee.employmentDocuments.length > 0 && (
          <section className="space-y-2 break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
              III. Riwayat Kepegawaian &amp; Surat Keputusan (SK)
            </h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="text-left p-1.5 border border-slate-200">Nama Surat / SK</th>
                  <th className="text-left p-1.5 border border-slate-200">Nomor SK</th>
                  <th className="text-center p-1.5 border border-slate-200">Tanggal</th>
                  <th className="text-left p-1.5 border border-slate-200">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {employee.employmentDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="p-1.5 border border-slate-200 font-medium">{doc.letterName}</td>
                    <td className="p-1.5 border border-slate-200">{doc.number || "-"}</td>
                    <td className="p-1.5 border border-slate-200 text-center">{fmtDate(doc.date)}</td>
                    <td className="p-1.5 border border-slate-200">{doc.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Pelatihan & Sertifikasi */}
        {(employee.certifications.length > 0 || employee.trainings.length > 0) && (
          <section className="space-y-2 break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
              IV. Sertifikasi &amp; Pelatihan
            </h3>
            {employee.certifications.length > 0 && (
              <div className="space-y-1 text-xs mb-2">
                {employee.certifications.map((cert) => (
                  <div key={cert.id} className="rounded border border-slate-200 p-2 bg-slate-50">
                    <span className="font-semibold">
                      {cert.isCertifiedTeacher ? "Guru Tersertifikasi" : "Sertifikasi"}
                    </span>
                    {cert.certificationYear && ` (${cert.certificationYear})`}
                    {cert.educationCertificateNumber && ` · No. Serdik: ${cert.educationCertificateNumber}`}
                    {cert.inpassingSkNumber && ` · SK Inpassing: ${cert.inpassingSkNumber}`}
                  </div>
                ))}
              </div>
            )}

            {employee.trainings.length > 0 && (
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="text-left p-1.5 border border-slate-200">Nama Pelatihan</th>
                    <th className="text-left p-1.5 border border-slate-200">Jenis / Penyelenggara</th>
                    <th className="text-center p-1.5 border border-slate-200">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {employee.trainings.map((t) => (
                    <tr key={t.id}>
                      <td className="p-1.5 border border-slate-200 font-medium">{t.name}</td>
                      <td className="p-1.5 border border-slate-200">
                        {t.type}
                        {t.organizerLocation ? ` · ${t.organizerLocation}` : ""}
                      </td>
                      <td className="p-1.5 border border-slate-200 text-center">{fmtDate(t.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* Organisasi Kemasyarakatan & Unit Kerja Lain */}
        {(employee.socialOrganizations.length > 0 ||
          employee.workUnits.some((w) => w.worksElsewhere)) && (
          <section className="space-y-2 break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
              V. Pengalaman Organisasi &amp; Unit Kerja Lain
            </h3>
            <ul className="list-disc list-inside text-xs space-y-1 text-slate-700">
              {employee.socialOrganizations.map((org) => (
                <li key={org.id}>
                  <span className="font-medium">{org.organizationName || "Organisasi"}</span>
                  {org.position ? ` — ${org.position}` : ""}
                  {org.joinDate ? ` (sejak ${fmtDate(org.joinDate)})` : ""}
                </li>
              ))}
              {employee.workUnits
                .filter((w) => w.worksElsewhere)
                .map((w) => (
                  <li key={w.id}>
                    <span className="font-medium">{w.workplaceName || "Unit Kerja Lain"}</span>
                    {w.position ? ` — ${w.position}` : ""}
                    {w.status ? ` (${w.status})` : ""}
                  </li>
                ))}
            </ul>
          </section>
        )}

        {/* Footer Cetak */}
        <footer className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Dicetak melalui {appConfig?.appName || "SIMKA9"}</span>
          <span>Tanggal cetak: {format(new Date(), "dd MMMM yyyy, HH:mm", { locale: localeId })}</span>
        </footer>
      </div>
    </div>
  )
}
