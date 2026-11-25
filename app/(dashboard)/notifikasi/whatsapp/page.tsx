import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Role } from "@/app/generated/prisma/enums"
import { resolveEmployeeAccessScope } from "@/lib/employee-scope"
import { WhatsAppClient } from "./whatsapp-client"

export const dynamic = "force-dynamic"

export default async function WhatsAppGatewayPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const role = session.user.role as Role
  if (role !== Role.SUPER_ADMIN && role !== Role.HR) {
    redirect("/notifikasi")
  }

  const scope = await resolveEmployeeAccessScope(session.user)

  const [config, departments, logs] = await Promise.all([
    prisma.appConfiguration.findFirst({
      select: {
        waEnabled: true,
        waProvider: true,
        waApiUrl: true,
        waApiToken: true,
      },
    }),
    prisma.department.findMany({
      where: {
        isActive: true,
        ...(scope.isUnitScoped && scope.scopedDepartmentId
          ? { id: scope.scopedDepartmentId }
          : {}),
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.whatsAppLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <WhatsAppClient
        isConfigured={Boolean(config?.waEnabled && config?.waApiToken)}
        waEnabled={Boolean(config?.waEnabled)}
        waProvider={config?.waProvider ?? "FONNTE"}
        departments={departments}
        isUnitScoped={scope.isUnitScoped}
        lockedDepartmentId={scope.scopedDepartmentId}
        lockedDepartmentName={scope.scopedDepartmentName}
        logs={logs.map((l) => ({
          id: l.id,
          phoneNumber: l.phoneNumber,
          message: l.message,
          provider: l.provider,
          status: l.status,
          response: l.response,
          createdAt: l.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
