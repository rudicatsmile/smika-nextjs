import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Role } from "@/app/generated/prisma/enums"
import {
  resolveEmployeeAccessScope,
  compareEmployeesByHierarchy,
} from "@/lib/employee-scope"
import { evaluateEmployeeCompleteness } from "@/lib/document-completeness"
import { RekapBerkasClient } from "./rekap-berkas-client"

export const dynamic = "force-dynamic"

export default async function RekapBerkasPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (role === "PEGAWAI") {
    redirect(
      session.user.employeeId
        ? `/pegawai/${session.user.employeeId}?tab=dokumen-penting`
        : "/dashboard"
    )
  }

  const scope = await resolveEmployeeAccessScope(session.user)

  const [rawEmployees, departments] = await Promise.all([
    prisma.employee.findMany({
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
    }),
    prisma.department.findMany({
      where: {
        isActive: true,
        ...(scope.isUnitScoped && scope.scopedDepartmentId
          ? { id: scope.scopedDepartmentId }
          : {}),
      },
      select: { id: true, name: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ])

  const sorted = [...rawEmployees].sort(compareEmployeesByHierarchy)
  const rows = sorted.map(evaluateEmployeeCompleteness)

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <RekapBerkasClient
        rows={rows}
        departments={departments}
        isUnitScoped={scope.isUnitScoped}
        lockedDepartmentId={scope.scopedDepartmentId}
        lockedDepartmentName={scope.scopedDepartmentName}
      />
    </div>
  )
}
