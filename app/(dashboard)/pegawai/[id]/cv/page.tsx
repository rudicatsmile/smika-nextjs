import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  resolveEmployeeAccessScope,
  canAccessEmployeeRecord,
} from "@/lib/employee-scope"
import { CvPrintClient } from "./cv-print-client"

export const dynamic = "force-dynamic"

export default async function PegawaiCvPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const scope = await resolveEmployeeAccessScope(session.user)
  const { id } = await params

  const [employee, appConfig] = await Promise.all([
    prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        religion: true,
        bloodType: true,
        employmentStatusRef: true,
        subject: true,
        educationHistories: {
          include: { education: true },
          orderBy: [{ graduationYear: "desc" }, { createdAt: "desc" }],
        },
        employmentDocuments: {
          orderBy: { date: "desc" },
        },
        trainings: {
          orderBy: { date: "desc" },
        },
        certifications: {
          orderBy: { certificationYear: "desc" },
        },
        workUnits: {
          orderBy: { createdAt: "desc" },
        },
        socialOrganizations: {
          orderBy: { joinDate: "desc" },
        },
      },
    }),
    prisma.appConfiguration.findFirst({
      select: {
        appName: true,
        appOwner: true,
        logoUrl: true,
        address: true,
        phone: true,
        email: true,
        website: true,
      },
    }),
  ])

  if (!employee) notFound()
  if (!canAccessEmployeeRecord(scope, employee)) notFound()

  return <CvPrintClient employee={employee as any} appConfig={appConfig} />
}
