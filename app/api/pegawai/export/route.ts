import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const employees = await prisma.employee.findMany({
    include: { department: true, position: true, religion: true, bloodType: true },
    orderBy: { fullName: "asc" },
  })

  const rows = employees.map((e) => ({
    NIP: e.employeeIdNumber,
    NIK: e.nationalIdNumber ?? "",
    "Nama Lengkap": e.fullName,
    "Jenis Kelamin": e.gender === "LAKI_LAKI" ? "Laki-laki" : e.gender === "PEREMPUAN" ? "Perempuan" : "",
    "Tempat Lahir": e.placeOfBirth ?? "",
    "Tanggal Lahir": e.dateOfBirth ? new Date(e.dateOfBirth).toLocaleDateString("id-ID") : "",
    Agama: e.religion?.name ?? "",
    "Gol. Darah": e.bloodType?.name ?? "",
    "Status Pernikahan": e.maritalStatus ?? "",
    "Unit/Departemen": e.department?.name ?? "",
    Jabatan: e.position?.name ?? "",
    "Status Kepegawaian": e.employmentStatus,
    "Tgl Bergabung": e.joinDate ? new Date(e.joinDate).toLocaleDateString("id-ID") : "",
    "Pendidikan Terakhir": e.highestEducation ?? "",
    "Jurusan/Prodi": e.major ?? "",
    "Nama Institusi": e.institutionName ?? "",
    "Tahun Lulus": e.graduationYear ?? "",
    Email: e.email ?? "",
    "No. Telepon": e.phoneNumber ?? "",
    Alamat: e.address ?? "",
    Provinsi: e.province ?? "",
    NUPTK: e.educatorIdNumber ?? "",
    BPJS: e.bpjsNumber ?? "",
    NPWP: e.taxIdNumber ?? "",
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data Pegawai")
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="data-pegawai-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}
