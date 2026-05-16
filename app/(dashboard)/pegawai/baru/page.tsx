import { prisma } from "@/lib/prisma"
import { EmployeeForm } from "@/components/forms/employee-form"

export default async function TambahPegawaiPage() {
  const [departments, positions, positionDepartments, religions, bloodTypes, employmentStatuses, educations, subjects] = await Promise.all([
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.position.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.positionDepartment.findMany(),
    prisma.religion.findMany({ where: { isActive: true } }),
    prisma.bloodType.findMany({ where: { isActive: true } }),
    prisma.employmentStatusMaster.findMany({ where: { isActive: true } }),
    prisma.education.findMany({ where: { isActive: true }, orderBy: { level: "asc" } }),
    prisma.subject.findMany({ where: { isActive: true }, orderBy: { urutan: "asc" } }),
  ])

  return (
    <EmployeeForm
      mode="create"
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
