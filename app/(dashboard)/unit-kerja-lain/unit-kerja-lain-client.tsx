"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BuildingIcon, Building2, User, Loader2, Search, MapPin, Briefcase } from "lucide-react"
import { getAllWorkUnits } from "@/server/actions/work-unit"
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

interface WorkUnit {
  id: string
  worksElsewhere: boolean
  workplaceName?: string
  status?: string
  position?: string
  positionFunction?: string
  workplaceAddress?: string
  employee: {
    id: string
    fullName: string
    employeeIdNumber: string
    department: { id: string; name: string }
  }
}

export function UnitKerjaLainClient({
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
  const [workUnits, setWorkUnits] = useState<WorkUnit[]>([])
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

  const fetchWorkUnits = async () => {
    setIsPending(true)
    try {
      const result = await getAllWorkUnits({
        departmentId: selectedDepartment || undefined,
        employeeId: selectedEmployee || undefined,
        search: searchQuery || undefined,
      })
      if (result.success) setWorkUnits(result.data)
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchWorkUnits()
    }
  }, [selectedDepartment, selectedEmployee, searchQuery, mounted])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWorkUnits()
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BuildingIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Unit Kerja Lain</h1>
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
                  placeholder="Cari nama, tempat kerja, atau jabatan..."
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
          <CardTitle>Daftar Unit Kerja Lain</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : workUnits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data unit kerja lain
            </div>
          ) : (
            <div className="space-y-4">
              {workUnits.map((unit) => (
                <div key={unit.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">
                          {unit.worksElsewhere ? "Bekerja/Mengajar Di Tempat Lain" : "Tidak Bekerja Di Tempat Lain"}
                        </span>
                        <Badge variant={unit.worksElsewhere ? "default" : "secondary"}>
                          {unit.worksElsewhere ? "Ya" : "Tidak"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{unit.employee.fullName}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="font-mono text-xs">{unit.employee.employeeIdNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{unit.employee.department.name}</span>
                      </div>
                      {unit.workplaceName && (
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Tempat:</span>
                          <span>{unit.workplaceName}</span>
                        </div>
                      )}
                      {unit.status && (
                        <div className="text-sm text-muted-foreground">
                          Status: {unit.status}
                        </div>
                      )}
                      {unit.position && (
                        <div className="flex items-center gap-1 text-sm">
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Jabatan:</span>
                          <span>{unit.position}</span>
                        </div>
                      )}
                      {unit.positionFunction && (
                        <div className="text-sm text-muted-foreground">
                          Fungsi Jabatan: {unit.positionFunction}
                        </div>
                      )}
                      {unit.workplaceAddress && (
                        <div className="flex items-start gap-1 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                          <span className="text-muted-foreground">Alamat:</span>
                          <span className="flex-1">{unit.workplaceAddress}</span>
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
