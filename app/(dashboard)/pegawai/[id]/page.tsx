import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EmployeeDetailClient } from "./employee-detail-client"

export const dynamic = "force-dynamic"

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [employee, educations, educationHistories, occupations, children, spouses, trainings, employmentDocuments, certifications, workUnits, healthData] = await Promise.all([
    prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        religion: true,
        bloodType: true,
        employmentStatusRef: true,
        documents: { orderBy: { uploadedAt: "desc" } },
        history: { orderBy: { date: "desc" } },
      },
    }),
    prisma.education.findMany({ where: { isActive: true }, orderBy: { level: "asc" } }),
    prisma.educationHistory.findMany({
      where: { employeeId: id },
      include: { education: true },
      orderBy: { graduationYear: "desc" },
    }),
    prisma.occupation.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.child.findMany({
      where: { employeeId: id },
      include: { education: true, occupation: true },
      orderBy: { dateOfBirth: "desc" },
    }),
    prisma.spouse.findMany({
      where: { employeeId: id },
      include: { education: true, occupation: true },
      orderBy: { dateOfBirth: "desc" },
    }),
    prisma.training.findMany({
      where: { employeeId: id },
      orderBy: { date: "desc" },
    }),
    prisma.employmentDocument.findMany({
      where: { employeeId: id },
      orderBy: { date: "desc" },
    }),
    prisma.certification.findMany({
      where: { employeeId: id },
      orderBy: { certificationYear: "desc" },
    }),
    prisma.workUnit.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.healthData.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: "desc" },
    }),
  ])

  if (!employee) notFound()

  return (
    <EmployeeDetailClient
      employee={employee}
      educations={educations}
      educationHistories={educationHistories}
      occupations={occupations}
      children={children}
      spouses={spouses}
      trainings={trainings}
      employmentDocuments={employmentDocuments}
      certifications={certifications}
      workUnits={workUnits}
      healthData={healthData}
    />
  )
}
