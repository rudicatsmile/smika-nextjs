import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function LaporanJabatanPage() {
  const [employees, positions, departments] = await Promise.all([
    prisma.employee.findMany({
      where: { employmentStatus: "AKTIF" },
      include: {
        position: true,
        department: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.position.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ])

  // Global report: Count employees per position across all departments
  const globalReport = positions.map((position: any) => {
    const count = employees.filter((emp: any) => emp.positionId === position.id).length
    return {
      positionName: position.name,
      count,
    }
  }).filter((item: any) => item.count > 0)

  // Per-department report: Count employees per position for each department
  const departmentReport = departments.map((department: any) => {
    const deptEmployees = employees.filter((emp: any) => emp.departmentId === department.id)
    const positionCounts = positions.map((position: any) => {
      const count = deptEmployees.filter((emp: any) => emp.positionId === position.id).length
      return {
        positionName: position.name,
        count,
      }
    }).filter((item: any) => item.count > 0)

    return {
      departmentName: department.name,
      departmentType: department.departmentType,
      positionCounts,
      total: deptEmployees.length,
    }
  }).filter((dept: any) => dept.total > 0)

  // Per-type report: Count employees per position grouped by department type
  const typeReport = departments.reduce((acc: any, dept: any) => {
    const type = dept.departmentType
    if (!acc[type]) {
      acc[type] = { type, positionCounts: {}, total: 0 }
    }
    const deptEmployees = employees.filter((emp: any) => emp.departmentId === dept.id)
    deptEmployees.forEach((emp: any) => {
      if (emp.position) {
        const posName = emp.position.name
        if (!acc[type].positionCounts[posName]) {
          acc[type].positionCounts[posName] = 0
        }
        acc[type].positionCounts[posName]++
      }
    })
    acc[type].total += deptEmployees.length
    return acc
  }, {} as Record<string, { type: string; positionCounts: Record<string, number>; total: number }>)

  const typeReportArray = Object.values(typeReport)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Jabatan</h1>
        <p className="text-muted-foreground text-sm">Rekapitulasi jumlah pegawai berdasarkan jabatan</p>
      </div>

      {/* Global Report */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Laporan Global (Semua Departemen)</h2>
        </div>
        <div className="p-4">
          {globalReport.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada data</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2">Jabatan</th>
                  <th className="text-right py-2 px-2">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {globalReport.map((item: any, i: any) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2 px-2">{item.positionName}</td>
                    <td className="text-right py-2 px-2 font-semibold">{item.count}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border bg-muted/30">
                  <td className="py-2 px-2 font-semibold">Total</td>
                  <td className="text-right py-2 px-2 font-semibold">{globalReport.reduce((sum: any, item: any) => sum + item.count, 0)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Per-Department Report */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Laporan Per Departemen</h2>
        </div>
        <div className="p-4 space-y-6">
          {departmentReport.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada data</p>
          ) : (
            departmentReport.map((dept: any) => (
              <div key={dept.departmentName} className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-3 py-2 flex justify-between items-center">
                  <span className="font-medium text-sm">{dept.departmentName}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{dept.departmentType}</span>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {dept.positionCounts.map((item: any, i: any) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-2 px-3">{item.positionName}</td>
                        <td className="text-right py-2 px-3">{item.count}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-border bg-muted/20">
                      <td className="py-2 px-3 font-semibold">Total</td>
                      <td className="text-right py-2 px-3 font-semibold">{dept.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Per-Type Report */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Laporan Per Tipe Departemen</h2>
        </div>
        <div className="p-4 space-y-6">
          {typeReportArray.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada data</p>
          ) : (
            typeReportArray.map((type: any) => (
              <div key={type.type} className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-3 py-2 flex justify-between items-center">
                  <span className="font-medium text-sm">{type.type}</span>
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">{type.total} pegawai</span>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(type.positionCounts).map(([posName, count], i: any) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-2 px-3">{posName}</td>
                        <td className="text-right py-2 px-3">{count as number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
