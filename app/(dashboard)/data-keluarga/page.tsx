import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@/app/generated/prisma/enums"
import { loadScopedEmployeeFilterData } from "@/lib/employee-scope"
import { DataKeluargaClient } from "./data-keluarga-client"

export const dynamic = "force-dynamic"

export default async function DataKeluargaPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role as Role | undefined
  const filterData = await loadScopedEmployeeFilterData(session?.user)

  return (
    <DataKeluargaClient
      departments={filterData.departments}
      employees={filterData.employees}
      userRole={role}
      isUnitScoped={filterData.isUnitScoped}
      isSelfScoped={filterData.isSelfScoped}
      lockedDepartmentName={filterData.lockedDepartmentName}
    />
  )
}
