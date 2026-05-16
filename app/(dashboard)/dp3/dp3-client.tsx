"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Building2, Loader2, ClipboardCheck } from "lucide-react"
import { getEmployeesWithDP3Status } from "@/server/actions/dp3"
import { DP3FormDialog } from "@/components/dp3/dp3-form-dialog"
import { canAssessDP3 } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"

interface Department {
  id: string
  name: string
}

interface Year {
  id: string
  name: string
}

interface Employee {
  id: string
  fullName: string
  employeeIdNumber: string
  departmentId: string
  department: { id: string; name: string }
  dp3?: Array<{
    id: string
    tahunId: string
    statusDP3Id: string
    kualitasKerjaNilai: number
    kualitasKerjaAlasan: string | null
    kehadiranDanKedisiplinanNilai: number
    kehadiranDanKedisiplinanAlasan: string | null
    kerjasamaTimNilai: number
    kerjasamaTimAlasan: string | null
    komitmenVisiMisiNilai: number
    komitmenVisiMisiAlasan: string | null
    pengembanganDiriNilai: number
    pengembanganDiriAlasan: string | null
    penggunaanTeknologiNilai: number
    penggunaanTeknologiAlasan: string | null
    ketaatanKepatuhanNilai: number
    ketaatanKepatuhanAlasan: string | null
    komunikasiEfektifNilai: number
    komunikasiEfektifAlasan: string | null
    inisiatifProblemSolvingNilai: number
    inisiatifProblemSolvingAlasan: string | null
    jumlah: number
    rataRata: number
    bobot: number
    createdAt: Date
    tahun: { id: string; name: string }
    statusDP3: { id: string; name: string }
  }>
}

export function DP3Client({
  departments,
  years,
  employees: initialEmployees,
  userRole,
}: {
  departments: Department[]
  years: Year[]
  employees: Employee[]
  userRole?: Role
}) {
  const { data: session } = useSession()
  const role = session?.user?.role as Role | undefined
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [isPending, setIsPending] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedDP3, setSelectedDP3] = useState<Employee | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (userRole === "PIMPINAN" && departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0].id)
    }
  }, [userRole, departments, selectedDepartment])

  const fetchEmployees = async () => {
    setIsPending(true)
    try {
      const result = await getEmployeesWithDP3Status({
        departmentId: selectedDepartment || undefined,
        tahunId: selectedYear || undefined,
      })
      if (result.success) setEmployees(result.data)
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchEmployees()
    }
  }, [selectedDepartment, selectedYear, mounted])

  const handleOpenDialog = (employee: Employee) => {
    setSelectedDP3(employee)
    setDialogOpen(true)
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Penilaian Pelaksanaan Pekerjaan (DP3)</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          {role !== "PEGAWAI" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Tahun</label>
                  <Select value={selectedYear || "all"} onValueChange={(v) => setSelectedYear(v === "all" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tahun</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Departemen</label>
                  {userRole === "PIMPINAN" ? (
                    <div className="p-2 border rounded-md bg-muted/50 text-sm">
                      {departments.length > 0 ? departments[0].name : "-"}
                    </div>
                  ) : (
                    <Select value={selectedDepartment || "all"} onValueChange={(v) => setSelectedDepartment(v === "all" ? "" : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Departemen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Departemen</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Menampilkan penilaian DP3 Anda sendiri</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pegawai</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data pegawai
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((emp) => {
                const latestDP3 = emp.dp3 && emp.dp3.length > 0 ? emp.dp3[0] : null
                return (
                  <div key={emp.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{emp.fullName}</span>
                          <span className="text-muted-foreground/60">•</span>
                          <span className="font-mono text-xs">{emp.employeeIdNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{emp.department.name}</span>
                        </div>
                        {latestDP3 && (
                          <div className="border-t pt-2 mt-2 space-y-1">
                            <div className="text-sm text-muted-foreground">
                              Tahun: {latestDP3.tahun.name}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="default">
                                {latestDP3.statusDP3.name}
                              </Badge>
                            </div>
                            <div className="flex gap-4 text-sm">
                              <div className="text-muted-foreground">
                                Jumlah: <span className="font-semibold">{latestDP3.jumlah}</span>
                              </div>
                              <div className="text-muted-foreground">
                                Rata-rata: <span className="font-semibold">{latestDP3.rataRata}</span>
                              </div>
                              <div className="text-muted-foreground">
                                Bobot: <span className="font-semibold">{latestDP3.bobot}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {role && canAssessDP3(role) && (
                        <Button onClick={() => handleOpenDialog(emp)} size="sm">
                          {latestDP3 ? "Update" : "Isi Penilaian"}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <DP3FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={selectedDP3}
        years={years}
        onSuccess={fetchEmployees}
      />
    </div>
  )
}
