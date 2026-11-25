import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resolveEmployeeAccessScope } from "@/lib/employee-scope"
import { EmployeeForm } from "@/components/forms/employee-form"

export const dynamic = "force-dynamic"

export default async function TambahPegawaiPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  const scope = await resolveEmployeeAccessScope(session.user)
  if (!scope.canMutateEmployees) {
    redirect("/pegawai")
  }

  const [departments, positions, positionDepartments, religions, bloodTypes, employmentStatuses, educations, subjects] = await Promise.all([
    prisma.department.findMany({
      where: scope.isUnitScoped && scope.unitDepartmentId
        ? { id: scope.unitDepartmentId, isActive: true }
        : { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, canTeach: true },
    }),
    prisma.position.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.positionDepartment.findMany(),
    prisma.religion.findMany({ where: { isActive: true } }),
    prisma.bloodType.findMany({ where: { isActive: true } }),
    prisma.employmentStatusMaster.findMany({ where: { isActive: true } }),
    prisma.education.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.subject.findMany({ where: { isActive: true }, orderBy: { urutan: "asc" } }),
  ])

  return (
    <EmployeeForm
      mode="create"
      lockedDepartmentId={scope.isUnitScoped ? scope.unitDepartmentId : null}
      departments={departments}
      positions={positions}
      positionDepartments={positionDepartments}
      religions={religions}
      bloodTypes={bloodTypes}
      employmentStatuses={employmentStatuses}
      educations={educations}
      subjects={subjects}
    />
  )
}
