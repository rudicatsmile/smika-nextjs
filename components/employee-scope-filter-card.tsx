"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"

export interface FilterDepartmentOption {
  id: string
  name: string
}

export interface FilterEmployeeOption {
  id: string
  fullName: string
  employeeIdNumber?: string | null
  departmentId?: string | null
  department?: { id: string; name: string } | null
}

interface EmployeeScopeFilterCardProps {
  departments: FilterDepartmentOption[]
  employees: FilterEmployeeOption[]
  selectedDepartment: string
  selectedEmployee: string
  onDepartmentChange: (departmentId: string) => void
  onEmployeeChange: (employeeId: string) => void
  isUnitScoped?: boolean
  isSelfScoped?: boolean
  lockedDepartmentName?: string | null
}

/**
 * Panel filter Departemen + Pegawai dengan fitur pencarian nama/NIP pada dropdown Pegawai.
 */
export function EmployeeScopeFilterCard({
  departments,
  employees,
  selectedDepartment,
  selectedEmployee,
  onDepartmentChange,
  onEmployeeChange,
  isUnitScoped = false,
  isSelfScoped = false,
  lockedDepartmentName,
}: EmployeeScopeFilterCardProps) {
  const filteredEmployees = useMemo(() => {
    if (!selectedDepartment) return employees
    return employees.filter((emp) => emp.departmentId === selectedDepartment)
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

  if (isSelfScoped) return null

  const handleDepartmentChange = (value: string) => {
    onDepartmentChange(value === "all" ? "" : value)
    onEmployeeChange("")
  }

  return (
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
              <Select
                value={selectedDepartment || "all"}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua Departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Departemen</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
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
              onSelect={(v) => onEmployeeChange(v === "all" ? "" : v)}
              placeholder="Semua Pegawai"
              searchPlaceholder="Ketik nama atau NIP pegawai..."
              disabled={filteredEmployees.length === 0}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
