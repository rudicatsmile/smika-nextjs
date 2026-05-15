"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { History, GraduationCap, Building2, User, Loader2 } from "lucide-react"
import { getAllEducationHistories } from "@/server/actions/education-history"

interface Department {
  id: string
  name: string
}

interface Employee {
  id: string
  fullName: string
  employeeIdNumber: string
  departmentId: string
  department: { id: string; name: string }
}

interface EducationHistory {
  id: string
  educationId: string
  education: { id: string; name: string; level: string }
  institutionName?: string
  major?: string
  graduationYear?: number
  startDate?: string
  endDate?: string
  gpa?: number
  isGraduated: boolean
  employee: {
    id: string
    fullName: string
    employeeIdNumber: string
    department: { id: string; name: string }
  }
}

export function RiwayatPendidikanClient({
  departments,
  employees,
}: {
  departments: Department[]
  employees: Employee[]
}) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [histories, setHistories] = useState<EducationHistory[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees)
  const [isPending, setIsPending] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (selectedDepartment) {
      setFilteredEmployees(employees.filter((e) => e.departmentId === selectedDepartment))
      setSelectedEmployee("")
    } else {
      setFilteredEmployees(employees)
    }
  }, [selectedDepartment, employees])

  const fetchHistories = async () => {
    setIsPending(true)
    try {
      const result = await getAllEducationHistories({
        departmentId: selectedDepartment || undefined,
        employeeId: selectedEmployee || undefined,
      })
      if (result.success) {
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

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Departemen</label>
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
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Pegawai</label>
              <Select value={selectedEmployee || "all"} onValueChange={(v) => setSelectedEmployee(v === "all" ? "" : v)} disabled={!selectedDepartment && selectedDepartment !== ""}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedDepartment ? "Pilih Pegawai" : "Semua Pegawai"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pegawai</SelectItem>
                  {filteredEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeIdNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{history.employee.fullName}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="font-mono text-xs">{history.employee.employeeIdNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{history.employee.department.name}</span>
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
