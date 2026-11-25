import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Role } from "@/app/generated/prisma/enums"
import { resolveEmployeeAccessScope } from "@/lib/employee-scope"
import { formatCorrectionValue } from "@/lib/correction-fields"
import { PengajuanKoreksiClient } from "./pengajuan-koreksi-client"

export const dynamic = "force-dynamic"

export default async function PengajuanKoreksiPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const role = session.user.role as Role
  const isReviewer = role === Role.SUPER_ADMIN || role === Role.HR

  // Ambil data employee milik user saat ini (jika ada)
  const myEmployee = session.user.employeeId
    ? await prisma.employee.findUnique({
        where: { id: session.user.employeeId },
        select: {
          id: true,
          fullName: true,
          employeeIdNumber: true,
          phoneNumber: true,
          email: true,
          address: true,
          province: true,
          postalCode: true,
          secondaryAddress: true,
          maritalStatus: true,
          placeOfBirth: true,
          dateOfBirth: true,
          nationalIdNumber: true,
          bpjsNumber: true,
          taxIdNumber: true,
          educatorIdNumber: true,
        },
      })
    : session.user.nip
    ? await prisma.employee.findFirst({
        where: { employeeIdNumber: session.user.nip },
        select: {
          id: true,
          fullName: true,
          employeeIdNumber: true,
          phoneNumber: true,
          email: true,
          address: true,
          province: true,
          postalCode: true,
          secondaryAddress: true,
          maritalStatus: true,
          placeOfBirth: true,
          dateOfBirth: true,
          nationalIdNumber: true,
          bpjsNumber: true,
          taxIdNumber: true,
          educatorIdNumber: true,
        },
      })
    : null

  const myRequestsRaw = await prisma.dataCorrectionRequest.findMany({
    where: { requestedById: session.user.id },
    include: {
      employee: {
        select: {
          id: true,
          fullName: true,
          employeeIdNumber: true,
          department: { select: { name: true } },
        },
      },
      reviewedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  let reviewQueueRaw: typeof myRequestsRaw = []
  let isUnitScoped = false
  let lockedDepartmentName: string | null = null

  if (isReviewer) {
    const scope = await resolveEmployeeAccessScope(session.user)
    isUnitScoped = scope.isUnitScoped
    lockedDepartmentName = scope.scopedDepartmentName

    reviewQueueRaw = await prisma.dataCorrectionRequest.findMany({
      where: scope.isUnitScoped
        ? {
            employee: {
              departmentId: scope.scopedDepartmentId ?? "__UNASSIGNED_UNIT__",
            },
          }
        : undefined,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeIdNumber: true,
            department: { select: { name: true } },
          },
        },
        reviewedBy: { select: { name: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
    })
  }

  const serialize = (item: (typeof myRequestsRaw)[number]) => ({
    id: item.id,
    employeeId: item.employeeId,
    employeeName: item.employee.fullName,
    employeeNip: item.employee.employeeIdNumber,
    departmentName: item.employee.department?.name ?? "-",
    fieldKey: item.fieldKey,
    fieldLabel: item.fieldLabel,
    oldValue: formatCorrectionValue(item.fieldKey, item.oldValue),
    newValue: formatCorrectionValue(item.fieldKey, item.newValue),
    rawNewValue: item.newValue,
    reason: item.reason,
    status: item.status,
    reviewedByName: item.reviewedBy?.name ?? null,
    reviewNote: item.reviewNote,
    reviewedAt: item.reviewedAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
  })

  const currentValues: Record<string, string> = {}
  if (myEmployee) {
    for (const [k, v] of Object.entries(myEmployee)) {
      if (k === "id" || k === "fullName" || k === "employeeIdNumber") continue
      currentValues[k] = formatCorrectionValue(k, v as string | Date | null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <PengajuanKoreksiClient
        isReviewer={isReviewer}
        isUnitScoped={isUnitScoped}
        lockedDepartmentName={lockedDepartmentName}
        myEmployee={
          myEmployee
            ? {
                id: myEmployee.id,
                fullName: myEmployee.fullName,
                nip: myEmployee.employeeIdNumber,
                currentValues,
              }
            : null
        }
        myRequests={myRequestsRaw.map(serialize)}
        reviewQueue={reviewQueueRaw.map(serialize)}
      />
    </div>
  )
}
