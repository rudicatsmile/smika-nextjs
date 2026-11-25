"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  EmployeeScopeFilterCard,
  FilterDepartmentOption,
  FilterEmployeeOption,
} from "@/components/employee-scope-filter-card"
import { Badge } from "@/components/ui/badge"
import { UsersIcon, Building2, User, Loader2, Heart, Baby, Calendar, MapPin } from "lucide-react"
import { getAllChildren } from "@/server/actions/child"
import { getAllSpouses } from "@/server/actions/spouse"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Role } from "@/app/generated/prisma/enums"

interface FamilyMember {
  id: string
  name: string
  placeOfBirth?: string | null
  dateOfBirth?: Date | string | null
  gender?: string | null
  relationship?: string | null
  education?: { id: string; name: string; level: string } | null
  occupation?: { id: string; name: string } | null
  employee: {
    id: string
    fullName: string
    employeeIdNumber?: string | null
    department?: { id: string; name: string } | null
  }
}

const GENDER_LABELS: Record<string, string> = {
  LAKI_LAKI: "Laki-laki",
  PEREMPUAN: "Perempuan",
}

function FamilyMemberCard({ member }: { member: FamilyMember }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{member.name}</span>
            {member.gender && (
              <Badge variant="outline">{GENDER_LABELS[member.gender] || member.gender}</Badge>
            )}
            {member.relationship && (
              <Badge variant="secondary">{member.relationship}</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span>{member.employee.fullName}</span>
            {member.employee.employeeIdNumber && (
              <>
                <span className="text-muted-foreground/60">•</span>
                <span className="font-mono text-xs">{member.employee.employeeIdNumber}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span>{member.employee.department?.name ?? "-"}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {member.placeOfBirth && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{member.placeOfBirth}</span>
              </div>
            )}
            {member.dateOfBirth && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(member.dateOfBirth), "d MMM yyyy", { locale: id })}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {member.education && <div>Pendidikan: {member.education.name}</div>}
            {member.occupation && <div>Pekerjaan: {member.occupation.name}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DataKeluargaClient({
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
  const [children, setChildren] = useState<FamilyMember[]>([])
  const [spouses, setSpouses] = useState<FamilyMember[]>([])
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
      if (childrenResult.success && childrenResult.data) setChildren(childrenResult.data)
      if (spousesResult.success && spousesResult.data) setSpouses(spousesResult.data)
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
                  <FamilyMemberCard key={spouse.id} member={spouse} />
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
                  <FamilyMemberCard key={child.id} member={child} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
