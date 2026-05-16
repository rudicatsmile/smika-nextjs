"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollText, Building2, User, Loader2, Calendar, Download } from "lucide-react"
import { getAllEmploymentDocuments } from "@/server/actions/employment-document"
import { Role } from "@/app/generated/prisma/enums"
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

interface EmploymentDocument {
  id: string
  letterName: string
  date?: string
  number?: string
  description?: string
  file?: string
  employee: {
    id: string
    fullName: string
    employeeIdNumber: string
    department: { id: string; name: string }
  }
}

export function RiwayatKepegawaianClient({
  departments,
  employees,
  userRole,
}: {
  departments: Department[]
  employees: Employee[]
  userRole?: Role
}) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [documents, setDocuments] = useState<EmploymentDocument[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees)
  const [isPending, setIsPending] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (userRole === "PIMPINAN" && departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0].id)
    }
  }, [userRole, departments, selectedDepartment])

  useEffect(() => {
    if (selectedDepartment) {
      setFilteredEmployees(employees.filter((e) => e.departmentId === selectedDepartment))
      setSelectedEmployee("")
    } else {
      setFilteredEmployees(employees)
    }
  }, [selectedDepartment, employees])

  const fetchDocuments = async () => {
    setIsPending(true)
    try {
      const result = await getAllEmploymentDocuments({
        departmentId: selectedDepartment || undefined,
        employeeId: selectedEmployee || undefined,
      })
      if (result.success) setDocuments(result.data)
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchDocuments()
    }
  }, [selectedDepartment, selectedEmployee, mounted])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ScrollText className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Riwayat Kepegawaian</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
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
          <CardTitle>Daftar Riwayat Kepegawaian</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada riwayat kepegawaian
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{doc.letterName}</span>
                        {doc.number && (
                          <Badge variant="outline">No. {doc.number}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{doc.employee.fullName}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="font-mono text-xs">{doc.employee.employeeIdNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{doc.employee.department.name}</span>
                      </div>
                      {doc.date && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(new Date(doc.date), "d MMM yyyy", { locale: id })}</span>
                        </div>
                      )}
                      {doc.description && (
                        <div className="text-sm text-muted-foreground">
                          {doc.description}
                        </div>
                      )}
                      {doc.file && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = doc.file!
                            link.download = `surat-${doc.letterName.replace(/\s+/g, '-')}.pdf`
                            link.click()
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download File
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
