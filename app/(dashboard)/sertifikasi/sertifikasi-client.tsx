"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Building2, User, Loader2, Download, Search, GraduationCap } from "lucide-react"
import { getAllCertifications } from "@/server/actions/certification"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

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

interface Certification {
  id: string
  isCertifiedTeacher: boolean
  certificationBaseSchool?: string
  educationCertificateNumber?: string
  certificationYear?: number
  inpassingBaseSchool?: string
  inpassingSkNumber?: string
  inpassingSkYear?: number
  file?: string
  employee: {
    id: string
    fullName: string
    employeeIdNumber: string
    department: { id: string; name: string }
  }
}

export function SertifikasiClient({
  departments,
  employees,
}: {
  departments: Department[]
  employees: Employee[]
}) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [certifications, setCertifications] = useState<Certification[]>([])
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

  const fetchCertifications = async () => {
    setIsPending(true)
    try {
      const result = await getAllCertifications({
        departmentId: selectedDepartment || undefined,
        employeeId: selectedEmployee || undefined,
        search: searchQuery || undefined,
      })
      if (result.success) setCertifications(result.data)
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchCertifications()
    }
  }, [selectedDepartment, selectedEmployee, searchQuery, mounted])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCertifications()
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Sertifikasi Pegawai</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, nomor sertifikat, atau sekolah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit">Cari</Button>
            </form>
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
                <Combobox
                  options={[
                    { value: "", label: "Semua Pegawai" },
                    ...filteredEmployees.map((emp) => ({
                      value: emp.id,
                      label: `${emp.fullName} (${emp.employeeIdNumber})`,
                    })),
                  ]}
                  value={selectedEmployee || ""}
                  onSelect={(v) => setSelectedEmployee(v)}
                  placeholder={selectedDepartment ? "Pilih Pegawai" : "Semua Pegawai"}
                  disabled={!selectedDepartment && selectedDepartment !== ""}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Sertifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : certifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data sertifikasi
            </div>
          ) : (
            <div className="space-y-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">
                          {cert.isCertifiedTeacher ? "Guru Bersertifikasi" : "Guru Tidak Bersertifikasi"}
                        </span>
                        <Badge variant={cert.isCertifiedTeacher ? "default" : "secondary"}>
                          {cert.isCertifiedTeacher ? "Ya" : "Tidak"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{cert.employee.fullName}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="font-mono text-xs">{cert.employee.employeeIdNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{cert.employee.department.name}</span>
                      </div>
                      {cert.certificationBaseSchool && (
                        <div className="flex items-center gap-1 text-sm">
                          <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Sekolah Induk:</span>
                          <span>{cert.certificationBaseSchool}</span>
                        </div>
                      )}
                      {cert.educationCertificateNumber && (
                        <div className="text-sm text-muted-foreground">
                          No. Sertifikat: {cert.educationCertificateNumber}
                        </div>
                      )}
                      {cert.certificationYear && (
                        <div className="text-sm text-muted-foreground">
                          Tahun Sertifikasi: {cert.certificationYear}
                        </div>
                      )}
                      {(cert.inpassingBaseSchool || cert.inpassingSkNumber || cert.inpassingSkYear) && (
                        <div className="border-t pt-2 mt-2 space-y-1">
                          <div className="text-sm font-medium">Data Inpassing:</div>
                          {cert.inpassingBaseSchool && (
                            <div className="text-sm text-muted-foreground">
                              Sekolah Induk: {cert.inpassingBaseSchool}
                            </div>
                          )}
                          {cert.inpassingSkNumber && (
                            <div className="text-sm text-muted-foreground">
                              No. SK: {cert.inpassingSkNumber}
                            </div>
                          )}
                          {cert.inpassingSkYear && (
                            <div className="text-sm text-muted-foreground">
                              Tahun SK: {cert.inpassingSkYear}
                            </div>
                          )}
                        </div>
                      )}
                      {cert.file && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = cert.file!
                            link.download = `sertifikasi-${cert.id}.pdf`
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
