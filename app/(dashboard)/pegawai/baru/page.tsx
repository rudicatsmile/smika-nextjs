import { prisma } from "@/lib/prisma"
import { EmployeeForm } from "@/components/forms/employee-form"

export default async function TambahPegawaiPage() {
  const [departments, positions, religions, bloodTypes, employmentStatuses] = await Promise.all([
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.position.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.religion.findMany({ where: { isActive: true } }),
    prisma.bloodType.findMany({ where: { isActive: true } }),
    prisma.employmentStatusMaster.findMany({ where: { isActive: true } }),
  ])

  return (
    <EmployeeForm
      mode="create"
      departments={departments}
      positions={positions}
      religions={religions}
      bloodTypes={bloodTypes}
      employmentStatuses={employmentStatuses}
    />
  )
}
