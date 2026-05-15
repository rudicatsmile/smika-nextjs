"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Award, Building2, User, Loader2, Calendar, MapPin, FileText, Download } from "lucide-react"
import { getAllTrainings } from "@/server/actions/training"
import { format } from "date-fns"
import { id } from "date-fns/locale"

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

interface Training {
  id: string
  name: string
  type: string
  organizerLocation?: string
  batch?: string
  date?: string
  certificateNumber?: string
  certificateDate?: string
  certificateFile?: string
  employee: {
    id: string
    fullName: string
    employeeIdNumber: string
    department: { id: string; name: string }
  }
}

export function PelatihanClient({
  departments,
  employees,
}: {
  departments: Department[]
  employees: Employee[]
}) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [trainings, setTrainings] = useState<Training[]>([])
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

  const fetchTrainings = async () => {
    setIsPending(true)
    try {
      const result = await getAllTrainings({
        departmentId: selectedDepartment || undefined,
        employeeId: selectedEmployee || undefined,
      })
      if (result.success) setTrainings(result.data)
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchTrainings()
    }
  }, [selectedDepartment, selectedEmployee, mounted])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Award className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Pelatihan Pegawai</h1>
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
          <CardTitle>Daftar Pelatihan</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : trainings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data pelatihan
            </div>
          ) : (
            <div className="space-y-4">
              {trainings.map((training) => (
                <div key={training.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{training.name}</span>
                        <Badge variant="outline">{training.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{training.employee.fullName}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="font-mono text-xs">{training.employee.employeeIdNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{training.employee.department.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {training.organizerLocation && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{training.organizerLocation}</span>
                          </div>
                        )}
                        {training.batch && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <span>Angkatan: {training.batch}</span>
                          </div>
                        )}
                        {training.date && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(new Date(training.date), "d MMM yyyy", { locale: id })}</span>
                          </div>
                        )}
                      </div>
                      {(training.certificateNumber || training.certificateDate) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {training.certificateNumber && <div>No. Sertifikat: {training.certificateNumber}</div>}
                          {training.certificateDate && (
                            <div>Tgl. Sertifikat: {format(new Date(training.certificateDate), "d MMM yyyy", { locale: id })}</div>
                          )}
                        </div>
                      )}
                      {training.certificateFile && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = training.certificateFile!
                            link.download = `sertifikat-${training.name.replace(/\s+/g, '-')}.pdf`
                            link.click()
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Sertifikat
                        </Button>
                      )}
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
