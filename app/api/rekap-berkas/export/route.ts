import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/app/generated/prisma/enums"
import {
  resolveEmployeeAccessScope,
  compareEmployeesByHierarchy,
} from "@/lib/employee-scope"
import {
  evaluateEmployeeCompleteness,
  filterCompletenessRows,
} from "@/lib/document-completeness"
import * as XLSX from "xlsx"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as Role
  if (role === "PEGAWAI") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const scope = await resolveEmployeeAccessScope(session.user)
  const searchParams = req.nextUrl.searchParams

  const departmentId = scope.isUnitScoped
    ? scope.scopedDepartmentId ?? "__UNASSIGNED__"
    : searchParams.get("departmentId") ?? "ALL"
  const employmentStatus = searchParams.get("employmentStatus") ?? "ALL"
  const completeness = searchParams.get("completeness") ?? "ALL"
  const q = searchParams.get("q") ?? ""

  const rawEmployees = await prisma.employee.findMany({
    where: scope.employeeWhereFilter,
    select: {
      id: true,
      employeeIdNumber: true,
      fullName: true,
      profilePhoto: true,
      nationalIdNumber: true,
      bpjsNumber: true,
      taxIdNumber: true,
      employmentStatus: true,
      departmentId: true,
      department: { select: { id: true, name: true, order: true } },
      position: { select: { id: true, name: true, order: true } },
      importantDocuments: { select: { documentType: true, fileUrl: true } },
      healthData: { select: { bpjsNumber: true } },
    },
  })

  const sorted = [...rawEmployees].sort(compareEmployeesByHierarchy)
  const evaluated = sorted.map(evaluateEmployeeCompleteness)
  const filtered = filterCompletenessRows(evaluated, {
    departmentId,
    employmentStatus,
    completeness,
    q,
  })

  const excelRows = filtered.map((row, idx) => ({
    No: idx + 1,
    NIP: row.employeeIdNumber,
    "Nama Lengkap": row.fullName,
    "Unit / Departemen": row.departmentName,
    Jabatan: row.positionName,
    Status: row.employmentStatus,
    "Foto Profil": row.checks.photo ? "Ada" : "Belum",
    NIK: row.checks.nik ? "Ada" : "Belum",
    BPJS: row.checks.bpjs ? "Ada" : "Belum",
    NPWP: row.checks.npwp ? "Ada" : "Belum",
    KTP: row.checks.ktp ? "Ada" : "Belum",
    "Kartu Keluarga": row.checks.kk ? "Ada" : "Belum",
    Ijazah: row.checks.ijazah ? "Ada" : "Belum",
    "SK Pengangkatan": row.checks.sk ? "Ada" : "Belum",
    Skor: `${row.filledCount}/${row.totalCount}`,
    "Kelengkapan (%)": `${row.percentage}%`,
  }))

  const ws = XLSX.utils.json_to_sheet(excelRows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Rekap Berkas")
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="rekap-kelengkapan-berkas-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}
