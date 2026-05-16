import { prisma } from "@/lib/prisma"
import { DataDokumenPentingClient } from "./data-dokumen-penting-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@/app/generated/prisma/enums"

export const dynamic = "force-dynamic"

export default async function DataDokumenPentingPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role as Role | undefined
  const userEmployeeId = session?.user?.employeeId as string | undefined

  let departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })

  if (role === "PIMPINAN" && userEmployeeId) {
    const user = await prisma.employee.findUnique({
      where: { id: userEmployeeId },
      select: { departmentId: true },
    })
    if (user?.departmentId) {
      departments = departments.filter((d: { id: string }) => d.id === user.departmentId)
    }
  }

  return (
    <DataDokumenPentingClient
      departments={departments}
      userRole={role}
    />
  )
}
