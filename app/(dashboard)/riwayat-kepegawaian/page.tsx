import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@/app/generated/prisma/enums"
import { loadScopedEmployeeFilterData } from "@/lib/employee-scope"
import { RiwayatKepegawaianClient } from "./riwayat-kepegawaian-client"

export const dynamic = "force-dynamic"

export default async function RiwayatKepegawaianPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role as Role | undefined
  const filterData = await loadScopedEmployeeFilterData(session?.user)

  return (
    <RiwayatKepegawaianClient
      departments={filterData.departments}
      employees={filterData.employees}
      userRole={role}
      isUnitScoped={filterData.isUnitScoped}
      isSelfScoped={filterData.isSelfScoped}
      lockedDepartmentName={filterData.lockedDepartmentName}
    />
  )
}
