import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EmployeeForm } from "@/components/forms/employee-form"

export const dynamic = "force-dynamic"

export default async function EditPegawaiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [employee, departments, positions, positionDepartments, religions, bloodTypes, employmentStatuses, educations] = await Promise.all([
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
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.position.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.positionDepartment.findMany(),
    prisma.religion.findMany({ where: { isActive: true } }),
    prisma.bloodType.findMany({ where: { isActive: true } }),
    prisma.employmentStatusMaster.findMany({ where: { isActive: true } }),
    prisma.education.findMany({ where: { isActive: true }, orderBy: { level: "asc" } }),
  ])

  if (!employee) notFound()

  return (
    <EmployeeForm
      mode="edit"
      initialData={{ ...employee, id: employee.id } as any}
      departments={departments}
      positions={positions}
      positionDepartments={positionDepartments}
      religions={religions}
      bloodTypes={bloodTypes}
      employmentStatuses={employmentStatuses}
      educations={educations}
    />
  )
}
