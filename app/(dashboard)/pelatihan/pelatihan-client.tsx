"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  EmployeeScopeFilterCard,
  FilterDepartmentOption,
  FilterEmployeeOption,
} from "@/components/employee-scope-filter-card"
import { Badge } from "@/components/ui/badge"
import { Award, Building2, User, Loader2, Calendar, MapPin, Download } from "lucide-react"
import { getAllTrainings } from "@/server/actions/training"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Role } from "@/app/generated/prisma/enums"

interface Training {
  id: string
  name: string
  type: string
  organizerLocation?: string | null
  batch?: string | null
  date?: Date | string | null
  certificateNumber?: string | null
  certificateDate?: Date | string | null
  certificateFile?: string | null
  employee: {
    id: string
    fullName: string
    employeeIdNumber?: string | null
    department?: { id: string; name: string } | null
  }
}

export function PelatihanClient({
  departments,
  employees,
  userRole,
  isUnitScoped = false,
  isSelfScoped = false,
  lockedDepartmentName,
}: {
  departments: FilterDepartmentOption[]
  employees: FilterEmployeeOption[]
  userRole?: Role
  isUnitScoped?: boolean
  isSelfScoped?: boolean
  lockedDepartmentName?: string | null
}) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    isUnitScoped && departments.length > 0 ? departments[0].id : ""
  )
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [trainings, setTrainings] = useState<Training[]>([])
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

  const fetchTrainings = async () => {
    setIsPending(true)
    try {
      const result = await getAllTrainings({
        departmentId: selectedDepartment || undefined,
        employeeId: selectedEmployee || undefined,
      })
      if (result.success && result.data) setTrainings(result.data)
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

      <EmployeeScopeFilterCard
        departments={departments}
        employees={employees}
        selectedDepartment={selectedDepartment}
        selectedEmployee={selectedEmployee}
        onDepartmentChange={setSelectedDepartment}
        onEmployeeChange={setSelectedEmployee}
        isUnitScoped={isUnitScoped}
        isSelfScoped={isSelfScoped}
        lockedDepartmentName={lockedDepartmentName}
      />

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
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span>{training.employee.fullName}</span>
                        {training.employee.employeeIdNumber && (
                          <>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="font-mono text-xs">{training.employee.employeeIdNumber}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span>{training.employee.department?.name ?? "-"}</span>
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
