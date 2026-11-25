import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/app/generated/prisma/enums"
import { canViewDP3 } from "@/lib/rbac"
import { resolveEmployeeAccessScope } from "@/lib/employee-scope"
import * as XLSX from "xlsx"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as Role
  if (!canViewDP3(role) || role === "PEGAWAI") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const scope = await resolveEmployeeAccessScope(session.user)
  const sp = req.nextUrl.searchParams
  const tahunId = sp.get("tahunId")
  const rawDeptId = sp.get("departmentId")

  const effectiveDeptId = scope.isUnitScoped
    ? scope.scopedDepartmentId ?? "__UNASSIGNED_UNIT__"
    : rawDeptId && rawDeptId !== "ALL"
    ? rawDeptId
    : undefined

  const dp3List = await prisma.dP3.findMany({
    where: {
      ...(tahunId && tahunId !== "ALL" ? { tahunId } : {}),
      ...(effectiveDeptId
        ? { employee: { departmentId: effectiveDeptId } }
        : {}),
    },
    include: {
      tahun: { select: { name: true } },
      statusDP3: { select: { name: true } },
      employee: {
        select: {
          employeeIdNumber: true,
          fullName: true,
          department: { select: { name: true } },
          position: { select: { name: true } },
        },
      },
    },
    orderBy: [{ rataRata: "desc" }, { employee: { fullName: "asc" } }],
  })

  const rows = dp3List.map((d, idx) => ({
    Peringkat: idx + 1,
    NIP: d.employee.employeeIdNumber,
    "Nama Pegawai": d.employee.fullName,
    "Unit / Departemen": d.employee.department?.name ?? "-",
    Jabatan: d.employee.position?.name ?? "-",
    Tahun: d.tahun.name,
    Status: d.statusDP3.name,
    "Kualitas Kerja": d.kualitasKerjaNilai,
    "Kedisiplinan": d.kehadiranDanKedisiplinanNilai,
    "Kerjasama Tim": d.kerjasamaTimNilai,
    "Komitmen Visi Misi": d.komitmenVisiMisiNilai,
    "Pengembangan Diri": d.pengembanganDiriNilai,
    "Teknologi": d.penggunaanTeknologiNilai,
    "Ketaatan": d.ketaatanKepatuhanNilai,
    "Komunikasi": d.komunikasiEfektifNilai,
    "Inisiatif": d.inisiatifProblemSolvingNilai,
    Jumlah: d.jumlah,
    "Rata-rata": d.rataRata,
    Bobot: d.bobot,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Laporan DP3")
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-dp3-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}
