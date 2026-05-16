"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { HeartIcon, Building2, User, Loader2, Search } from "lucide-react"
import { getAllHealthData } from "@/server/actions/health-data"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { Role } from "@/app/generated/prisma/enums"

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

interface HealthData {
  id: string
  healthcareProviderName?: string
  level1HealthFacility?: string
  bpjsNumber?: string
  employee: {
    id: string
    fullName: string
    employeeIdNumber: string
    department: { id: string; name: string }
  }
}

export function DataKesehatanClient({
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
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [healthDataList, setHealthDataList] = useState<HealthData[]>([])
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

  const fetchHealthData = async () => {
    setIsPending(true)
    try {
      const result = await getAllHealthData({
        departmentId: selectedDepartment || undefined,
        employeeId: selectedEmployee || undefined,
        search: searchQuery || undefined,
      })
      if (result.success) setHealthDataList(result.data)
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchHealthData()
    }
  }, [selectedDepartment, selectedEmployee, searchQuery, mounted])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchHealthData()
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <HeartIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Data Kesehatan</h1>
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
                  placeholder="Cari nama, tempat penyelenggara, atau BPJS..."
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
          <CardTitle>Daftar Data Kesehatan</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : healthDataList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data kesehatan
            </div>
          ) : (
            <div className="space-y-4">
              {healthDataList.map((healthData) => (
                <div key={healthData.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{healthData.employee.fullName}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="font-mono text-xs">{healthData.employee.employeeIdNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{healthData.employee.department.name}</span>
                      </div>
                      {healthData.healthcareProviderName && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Nama Tempat Penyelenggara:</span> {healthData.healthcareProviderName}
                        </div>
                      )}
                      {healthData.level1HealthFacility && (
                        <div className="text-sm text-muted-foreground">
                          Fasilitas Kesehatan Tingkat 1: {healthData.level1HealthFacility}
                        </div>
                      )}
                      {healthData.bpjsNumber && (
                        <div className="text-sm text-muted-foreground">
                          Nomor BPJS: {healthData.bpjsNumber}
                        </div>
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
