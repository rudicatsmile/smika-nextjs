"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { UsersIcon, Building2, User, Loader2, Heart, Baby, Calendar, MapPin } from "lucide-react"
import { getAllChildren } from "@/server/actions/child"
import { getAllSpouses } from "@/server/actions/spouse"
import { format } from "date-fns"
import { id } from "date-fns/locale"
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

interface Child {
  id: string
  name: string
  placeOfBirth?: string
  dateOfBirth?: string
  gender?: string
  relationship?: string
  education?: { id: string; name: string; level: string }
  occupation?: { id: string; name: string }
  employee: {
    id: string
    fullName: string
    employeeIdNumber: string
    department: { id: string; name: string }
  }
}

interface Spouse {
  id: string
  name: string
  placeOfBirth?: string
  dateOfBirth?: string
  gender?: string
  relationship?: string
  education?: { id: string; name: string; level: string }
  occupation?: { id: string; name: string }
  employee: {
    id: string
    fullName: string
    employeeIdNumber: string
    department: { id: string; name: string }
  }
}

const GENDER_LABELS: Record<string, string> = {
  LAKI_LAKI: "Laki-laki",
  PEREMPUAN: "Perempuan",
}

export function DataKeluargaClient({
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
  const [children, setChildren] = useState<Child[]>([])
  const [spouses, setSpouses] = useState<Spouse[]>([])
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

  const fetchFamilyData = async () => {
    setIsPending(true)
    try {
      const [childrenResult, spousesResult] = await Promise.all([
        getAllChildren({
          departmentId: selectedDepartment || undefined,
          employeeId: selectedEmployee || undefined,
        }),
        getAllSpouses({
          departmentId: selectedDepartment || undefined,
          employeeId: selectedEmployee || undefined,
        }),
      ])
      if (childrenResult.success) setChildren(childrenResult.data)
      if (spousesResult.success) setSpouses(spousesResult.data)
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchFamilyData()
    }
  }, [selectedDepartment, selectedEmployee, mounted])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UsersIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Data Keluarga Pegawai</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Data Pasangan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : spouses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada data pasangan
              </div>
            ) : (
              <div className="space-y-4">
                {spouses.map((spouse) => (
                  <div key={spouse.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{spouse.name}</span>
                          {spouse.gender && (
                            <Badge variant="outline">{GENDER_LABELS[spouse.gender] || spouse.gender}</Badge>
                          )}
                          {spouse.relationship && (
                            <Badge variant="secondary">{spouse.relationship}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>{spouse.employee.fullName}</span>
                          <span className="text-muted-foreground/60">•</span>
                          <span className="font-mono text-xs">{spouse.employee.employeeIdNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{spouse.employee.department.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {spouse.placeOfBirth && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{spouse.placeOfBirth}</span>
                            </div>
                          )}
                          {spouse.dateOfBirth && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{format(new Date(spouse.dateOfBirth), "d MMM yyyy", { locale: id })}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {spouse.education && <div>Pendidikan: {spouse.education.name}</div>}
                          {spouse.occupation && <div>Pekerjaan: {spouse.occupation.name}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5" />
              Data Anak
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : children.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada data anak
              </div>
            ) : (
              <div className="space-y-4">
                {children.map((child) => (
                  <div key={child.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{child.name}</span>
                          {child.gender && (
                            <Badge variant="outline">{GENDER_LABELS[child.gender] || child.gender}</Badge>
                          )}
                          {child.relationship && (
                            <Badge variant="secondary">{child.relationship}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>{child.employee.fullName}</span>
                          <span className="text-muted-foreground/60">•</span>
                          <span className="font-mono text-xs">{child.employee.employeeIdNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{child.employee.department.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {child.placeOfBirth && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{child.placeOfBirth}</span>
                            </div>
                          )}
                          {child.dateOfBirth && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{format(new Date(child.dateOfBirth), "d MMM yyyy", { locale: id })}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {child.education && <div>Pendidikan: {child.education.name}</div>}
                          {child.occupation && <div>Pekerjaan: {child.occupation.name}</div>}
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
    </div>
  )
}
