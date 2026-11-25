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
import { ScrollText, Building2, User, Loader2, Calendar, Download } from "lucide-react"
import { getAllEmploymentDocuments } from "@/server/actions/employment-document"
import { Role } from "@/app/generated/prisma/enums"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface EmploymentDocument {
  id: string
  letterName: string
  date?: Date | string | null
  number?: string | null
  description?: string | null
  file?: string | null
  employee: {
    id: string
    fullName: string
    employeeIdNumber?: string | null
    department?: { id: string; name: string } | null
  }
}

export function RiwayatKepegawaianClient({
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
  const [documents, setDocuments] = useState<EmploymentDocument[]>([])
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

  const fetchDocuments = async () => {
    setIsPending(true)
    try {
      const result = await getAllEmploymentDocuments({
        departmentId: selectedDepartment || undefined,
        employeeId: selectedEmployee || undefined,
      })
      if (result.success && result.data) setDocuments(result.data)
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
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span>{doc.employee.fullName}</span>
                        {doc.employee.employeeIdNumber && (
                          <>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="font-mono text-xs">{doc.employee.employeeIdNumber}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span>{doc.employee.department?.name ?? "-"}</span>
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
