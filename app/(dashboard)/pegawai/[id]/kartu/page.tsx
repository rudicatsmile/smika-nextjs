import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  resolveEmployeeAccessScope,
  canAccessEmployeeRecord,
} from "@/lib/employee-scope"
import QRCode from "qrcode"
import { KartuClient } from "./kartu-client"

export const dynamic = "force-dynamic"

export default async function PegawaiKartuPage({
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
      select: {
        id: true,
        fullName: true,
        employeeIdNumber: true,
        profilePhoto: true,
        employmentStatus: true,
        joinDate: true,
        departmentId: true,
        department: { select: { name: true } },
        position: { select: { name: true } },
      },
    }),
    prisma.appConfiguration.findFirst({
      select: {
        appName: true,
        appOwner: true,
        logoUrl: true,
        address: true,
        phone: true,
        website: true,
        primaryColor: true,
      },
    }),
  ])

  if (!employee) notFound()
  if (!canAccessEmployeeRecord(scope, employee)) notFound()

  const hdrs = await headers()
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000"
  const proto = hdrs.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https")
  const verifyPath = `/verifikasi/${encodeURIComponent(employee.employeeIdNumber)}`
  const verifyUrl = `${proto}://${host}${verifyPath}`

  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 300,
    margin: 1,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  })

  return (
    <KartuClient
      employee={{
        ...employee,
        joinDate: employee.joinDate?.toISOString() ?? null,
      }}
      appConfig={appConfig}
      qrDataUrl={qrDataUrl}
      verifyPath={verifyPath}
      verifyUrl={verifyUrl}
    />
  )
}
