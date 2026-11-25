import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resolveEmployeeAccessScope, canMutateEmployeeRecord } from "@/lib/employee-scope"
import { EmployeeForm } from "@/components/forms/employee-form"

export const dynamic = "force-dynamic"

export default async function EditPegawaiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  const scope = await resolveEmployeeAccessScope(session.user)

  const { id } = await params
  const isSelfEdit = scope.isSelfScoped && scope.selfEmployeeId === id
  if (!scope.canMutateEmployees && !isSelfEdit) {
    redirect("/pegawai")
  }

  const [employee, departments, positions, positionDepartments, religions, bloodTypes, employmentStatuses, educations, subjects] = await Promise.all([
    prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        employmentStatusRef: true,
        religion: true,
        bloodType: true,
      },
    }),
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

  if (!employee) notFound()
  if (!isSelfEdit && !canMutateEmployeeRecord(scope, employee)) {
    notFound()
  }

  return (
    <EmployeeForm
      mode="edit"
      initialData={{ ...employee, id: employee.id } as any}
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
