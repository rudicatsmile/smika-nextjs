import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Role, EmploymentStatus } from "@/app/generated/prisma/enums"
import { canViewDP3 } from "@/lib/rbac"
import { resolveEmployeeAccessScope } from "@/lib/employee-scope"
import { DP3AnalitikClient } from "./dp3-analitik-client"

export const dynamic = "force-dynamic"

export default async function DP3AnalitikPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (!canViewDP3(role) || role === "PEGAWAI") {
    redirect("/dp3")
  }

  const scope = await resolveEmployeeAccessScope(session.user)

  const [years, departments, dp3Records, activeEmployees] = await Promise.all([
    prisma.year.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { name: "desc" }],
      select: { id: true, name: true },
    }),
    prisma.department.findMany({
      where: {
        isActive: true,
        ...(scope.isUnitScoped && scope.scopedDepartmentId
          ? { id: scope.scopedDepartmentId }
          : {}),
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.dP3.findMany({
      where: scope.isUnitScoped
        ? {
            employee: {
              departmentId: scope.scopedDepartmentId ?? "__UNASSIGNED_UNIT__",
            },
          }
        : undefined,
      include: {
        tahun: { select: { id: true, name: true, order: true } },
        statusDP3: { select: { id: true, name: true } },
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeIdNumber: true,
            departmentId: true,
            department: { select: { id: true, name: true } },
            position: { select: { name: true } },
          },
        },
      },
      orderBy: { rataRata: "desc" },
    }),
    prisma.employee.findMany({
      where: {
        ...scope.employeeWhereFilter,
        employmentStatus: EmploymentStatus.AKTIF,
      },
      select: { id: true, departmentId: true },
    }),
  ])

  const serializedRecords = dp3Records.map((r) => ({
    id: r.id,
    tahunId: r.tahunId,
    tahunName: r.tahun.name,
    tahunOrder: r.tahun.order,
    statusName: r.statusDP3.name,
    employeeId: r.employeeId,
    employeeName: r.employee.fullName,
    employeeNip: r.employee.employeeIdNumber,
    departmentId: r.employee.departmentId,
    departmentName: r.employee.department?.name ?? "-",
    positionName: r.employee.position?.name ?? "-",
    jumlah: r.jumlah,
    rataRata: r.rataRata,
    bobot: r.bobot,
    aspek: {
      kualitasKerja: r.kualitasKerjaNilai,
      kedisiplinan: r.kehadiranDanKedisiplinanNilai,
      kerjasama: r.kerjasamaTimNilai,
      komitmen: r.komitmenVisiMisiNilai,
      pengembanganDiri: r.pengembanganDiriNilai,
      teknologi: r.penggunaanTeknologiNilai,
      ketaatan: r.ketaatanKepatuhanNilai,
      komunikasi: r.komunikasiEfektifNilai,
      inisiatif: r.inisiatifProblemSolvingNilai,
    },
  }))

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <DP3AnalitikClient
        years={years}
        departments={departments}
        records={serializedRecords}
        activeEmployees={activeEmployees}
        isUnitScoped={scope.isUnitScoped}
        lockedDepartmentId={scope.scopedDepartmentId}
        lockedDepartmentName={scope.scopedDepartmentName}
      />
    </div>
  )
}
