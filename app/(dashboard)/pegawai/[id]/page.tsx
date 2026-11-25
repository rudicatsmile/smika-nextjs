import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resolveEmployeeAccessScope, canAccessEmployeeRecord } from "@/lib/employee-scope"
import { EmployeeDetailClient } from "./employee-detail-client"

export const dynamic = "force-dynamic"

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ tab?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  const scope = await resolveEmployeeAccessScope(session.user)

  const { id } = await params
  const { tab } = (await searchParams) || {}

  const [employee, educations, educationHistories, occupations, children, spouses, trainings, employmentDocuments, certifications, workUnits, healthData, socialOrganizations] = await Promise.all([
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
    prisma.education.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
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
    prisma.socialOrganization.findMany({
      where: { employeeId: id },
      orderBy: { joinDate: "desc" },
    }),
  ])

  if (!employee) notFound()
  if (!canAccessEmployeeRecord(scope, employee)) notFound()

  return (
    <Suspense fallback={null}>
      <EmployeeDetailClient
        employee={employee}
        initialTab={tab}
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
        socialOrganizations={socialOrganizations}
      />
    </Suspense>
  )
}
