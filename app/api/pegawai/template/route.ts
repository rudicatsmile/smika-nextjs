import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function GET() {
  const headers = [
    "NIP", "NIK", "Nama Lengkap", "Jenis Kelamin", "Tempat Lahir",
    "Tanggal Lahir", "Agama", "Status Pernikahan", "Email", "No. Telepon",
    "Unit/Departemen", "Jabatan", "Tgl Bergabung", "Pendidikan Terakhir",
    "Jurusan/Prodi", "Nama Institusi", "Tahun Lulus",
  ]

  const sample = [{
    NIP: "1234567890",
    NIK: "3171234567890001",
    "Nama Lengkap": "Ahmad Fauzi S.Pd.",
    "Jenis Kelamin": "Laki-laki",
    "Tempat Lahir": "Jakarta",
    "Tanggal Lahir": "1985-04-20",
    Agama: "Islam",
    "Status Pernikahan": "Menikah",
    Email: "ahmad@example.com",
    "No. Telepon": "08123456789",
    "Unit/Departemen": "MTs",
    Jabatan: "Guru",
    "Tgl Bergabung": "2010-08-01",
    "Pendidikan Terakhir": "S1",
    "Jurusan/Prodi": "Pendidikan Agama Islam",
    "Nama Institusi": "UIN Jakarta",
    "Tahun Lulus": 2008,
  }]

  const ws = XLSX.utils.json_to_sheet(sample, { header: headers })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Template")
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-import-pegawai.xlsx"',
    },
  })
}
