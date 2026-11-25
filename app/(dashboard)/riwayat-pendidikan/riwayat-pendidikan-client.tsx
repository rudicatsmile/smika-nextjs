"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import { Badge } from "@/components/ui/badge"
import { History, GraduationCap, Building2, User, Loader2 } from "lucide-react"
import { getAllEducationHistories } from "@/server/actions/education-history"
import { Role } from "@/app/generated/prisma/enums"

interface Department {
  id: string
  name: string
}

interface Employee {
  id: string
  fullName: string
  employeeIdNumber?: string | null
  departmentId?: string | null
  department?: { id: string; name: string } | null
}

interface EducationHistory {
  id: string
  educationId: string
  education: { id: string; name: string; level: string }
  institutionName?: string | null
  major?: string | null
  graduationYear?: number | null
  startDate?: Date | string | null
  endDate?: Date | string | null
  gpa?: number | null
  isGraduated: boolean
  employee: {
    id: string
    fullName: string
    employeeIdNumber?: string | null
    department?: { id: string; name: string } | null
  }
}

export function RiwayatPendidikanClient({
  departments,
  employees,
  userRole,
  isUnitScoped = false,
  isSelfScoped = false,
  lockedDepartmentName,
}: {
  departments: Department[]
  employees: Employee[]
  userRole?: Role
  isUnitScoped?: boolean
  isSelfScoped?: boolean
  lockedDepartmentName?: string | null
}) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    isUnitScoped && departments.length > 0 ? departments[0].id : ""
  )
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [histories, setHistories] = useState<EducationHistory[]>([])
  const [isPending, setIsPending] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isUnitScoped && departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0].id)
    }
  }, [isUnitScoped, departments, selectedDepartment])

  const filteredEmployees = useMemo(() => {
    if (!selectedDepartment) return employees
    return employees.filter((e) => e.departmentId === selectedDepartment)
  }, [selectedDepartment, employees])

  const employeeOptions = useMemo(
    () => [
      { value: "all", label: "Semua Pegawai" },
      ...filteredEmployees.map((emp) => ({
        value: emp.id,
        label: emp.employeeIdNumber
          ? `${emp.fullName} (${emp.employeeIdNumber})`
          : emp.fullName,
      })),
    ],
    [filteredEmployees]
  )

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value === "all" ? "" : value)
    setSelectedEmployee("")
  }

  const fetchHistories = async () => {
    setIsPending(true)
    try {
      const result = await getAllEducationHistories({
        departmentId: selectedDepartment || undefined,
        employeeId: selectedEmployee || undefined,
      })
      if (result.success && result.data) {
        setHistories(result.data)
      }
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchHistories()
    }
  }, [selectedDepartment, selectedEmployee, mounted])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Riwayat Pendidikan Pegawai</h1>
      </div>

      {!isSelfScoped && (
        <Card>
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Departemen</label>
                {isUnitScoped ? (
                  <div className="px-3 py-2 border rounded-md bg-muted/50 text-sm">
                    {lockedDepartmentName || (departments.length > 0 ? departments[0].name : "-")}
                  </div>
                ) : (
                  <Select value={selectedDepartment || "all"} onValueChange={handleDepartmentChange}>
                    <SelectTrigger className="w-full">
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
              <div>
                <label className="text-sm font-medium mb-2 block">Pegawai</label>
                <Combobox
                  options={employeeOptions}
                  value={selectedEmployee || "all"}
                  onSelect={(v) => setSelectedEmployee(v === "all" ? "" : v)}
                  placeholder="Semua Pegawai"
                  searchPlaceholder="Ketik nama atau NIP pegawai..."
                  disabled={filteredEmployees.length === 0}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Daftar Riwayat Pendidikan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : histories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data riwayat pendidikan
            </div>
          ) : (
            <div className="space-y-4">
              {histories.map((history) => (
                <div key={history.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-lg">{history.education.name}</span>
                        <Badge variant="outline">{history.education.level}</Badge>
                        {!history.isGraduated && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            Belum Lulus
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span>{history.employee.fullName}</span>
                        {history.employee.employeeIdNumber && (
                          <>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="font-mono text-xs">{history.employee.employeeIdNumber}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span>{history.employee.department?.name ?? "-"}</span>
                      </div>
                      {history.institutionName && (
                        <div className="text-sm">{history.institutionName}</div>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {history.major && <div>Major: {history.major}</div>}
                        {history.graduationYear && <div>Tahun: {history.graduationYear}</div>}
                        {history.gpa && <div>GPA: {history.gpa}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
