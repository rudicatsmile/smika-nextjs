import { prisma } from "@/lib/prisma"
import { JabatanClient } from "./jabatan-client"

export const dynamic = "force-dynamic"

export default async function JabatanPage() {
  const positions = await prisma.position.findMany({
    orderBy: { name: "asc" },
    include: {
      departments: {
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      departmentType: true,
    },
  })

  const positionsWithDepartments = positions.map((pos: any) => ({
    ...pos,
    departments: pos.departments.map((pd: any) => ({
      id: pd.department.id,
      name: pd.department.name,
    })),
  }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Master Data — Jabatan</h1>
        <p className="text-muted-foreground text-sm">Kelola daftar jabatan pegawai</p>
      </div>
      <JabatanClient positions={positionsWithDepartments} departments={departments} />
    </div>
  )
}
