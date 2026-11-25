import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { evaluateEmployeeCompleteness } from "@/lib/document-completeness"
import { PortalClient } from "./portal-client"

export const dynamic = "force-dynamic"

export default async function PortalPegawaiPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const employee = session.user.employeeId
    ? await prisma.employee.findUnique({
        where: { id: session.user.employeeId },
        include: {
          department: { select: { id: true, name: true, order: true } },
          position: { select: { id: true, name: true, order: true } },
          employmentStatusRef: { select: { name: true } },
          importantDocuments: { select: { documentType: true, fileUrl: true } },
          healthData: { select: { bpjsNumber: true } },
          kesediaan: { orderBy: { tanggal: "desc" }, take: 1 },
          dp3: {
            orderBy: [{ createdAt: "desc" }],
            take: 5,
            include: {
              tahun: { select: { name: true } },
              statusDP3: { select: { name: true } },
            },
          },
          _count: {
            select: {
              educationHistories: true,
              trainings: true,
              certifications: true,
              employmentDocuments: true,
            },
          },
        },
      })
    : session.user.nip
    ? await prisma.employee.findFirst({
        where: { employeeIdNumber: session.user.nip },
        include: {
          department: { select: { id: true, name: true, order: true } },
          position: { select: { id: true, name: true, order: true } },
          employmentStatusRef: { select: { name: true } },
          importantDocuments: { select: { documentType: true, fileUrl: true } },
          healthData: { select: { bpjsNumber: true } },
          kesediaan: { orderBy: { tanggal: "desc" }, take: 1 },
          dp3: {
            orderBy: [{ createdAt: "desc" }],
            take: 5,
            include: {
              tahun: { select: { name: true } },
              statusDP3: { select: { name: true } },
            },
          },
          _count: {
            select: {
              educationHistories: true,
              trainings: true,
              certifications: true,
              employmentDocuments: true,
            },
          },
        },
      })
    : null

  const [notifications, unreadNotifCount, correctionRequests, activityLogs] =
    await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.notification.count({
        where: { userId: session.user.id, readAt: null },
      }),
      prisma.dataCorrectionRequest.findMany({
        where: { requestedById: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.activityLog.findMany({
        where: {
          OR: [
            { userId: session.user.id },
            ...(employee ? [{ entityId: employee.id }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: { select: { name: true } },
        },
      }),
    ])

  const completeness = employee ? evaluateEmployeeCompleteness(employee) : null

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <PortalClient
        userName={session.user.name ?? "Pegawai"}
        employee={
          employee
            ? {
                id: employee.id,
                fullName: employee.fullName,
                employeeIdNumber: employee.employeeIdNumber,
                profilePhoto: employee.profilePhoto,
                employmentStatus: employee.employmentStatus,
                employmentStatusLabel:
                  employee.employmentStatusRef?.name ?? employee.employmentStatus,
                departmentName: employee.department?.name ?? "-",
                positionName: employee.position?.name ?? "-",
                joinDate: employee.joinDate?.toISOString() ?? null,
                email: employee.email,
                phoneNumber: employee.phoneNumber,
                counts: employee._count,
                latestKesediaan: employee.kesediaan[0]
                  ? {
                      tanggal: employee.kesediaan[0].tanggal.toISOString(),
                      isBersedia: employee.kesediaan[0].isBersedia,
                    }
                  : null,
                dp3History: employee.dp3.map((d) => ({
                  id: d.id,
                  tahun: d.tahun.name,
                  status: d.statusDP3.name,
                  rataRata: d.rataRata,
                  jumlah: d.jumlah,
                })),
              }
            : null
        }
        completeness={completeness}
        notifications={notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          readAt: n.readAt?.toISOString() ?? null,
          createdAt: n.createdAt.toISOString(),
        }))}
        unreadNotifCount={unreadNotifCount}
        correctionRequests={correctionRequests.map((c) => ({
          id: c.id,
          fieldLabel: c.fieldLabel,
          newValue: c.newValue,
          status: c.status,
          createdAt: c.createdAt.toISOString(),
        }))}
        activityLogs={activityLogs.map((log) => ({
          id: log.id,
          action: log.action,
          entity: log.entity,
          actorName: log.user?.name ?? "Sistem",
          createdAt: log.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
