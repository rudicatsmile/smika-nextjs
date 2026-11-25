"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Users as UsersOrgIcon, Building2, User, Loader2, Search, MapPin, Briefcase, Calendar } from "lucide-react"
import { getAllSocialOrganizations } from "@/server/actions/social-organization"
import { Combobox } from "@/components/ui/combobox"
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
  departmentId: string | null
  department: { id: string; name: string } | null
}

interface SocialOrganization {
  id: string
  organizationName?: string | null
  organizationAddress?: string | null
  position?: string | null
  joinDate?: Date | string | null
  employee: {
    id: string
    fullName: string
    employeeIdNumber: string
    department: { id: string; name: string } | null
  }
}

function cleanDisplayText(value?: string | null): string {
  if (!value) return ""
  return value.replace(/\\'/g, "'").replace(/\\"/g, '"').trim()
}

export function DataOrganisasiKemasyarakatanClient({
  departments,
  employees,
  userRole,
  isUnitScoped = false,
  lockedDepartmentName = null,
}: {
  departments: Department[]
  employees: Employee[]
  userRole?: Role
  isUnitScoped?: boolean
  lockedDepartmentName?: string | null
}) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [socialOrganizations, setSocialOrganizations] = useState<SocialOrganization[]>([])
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

  const fetchSocialOrganizations = async () => {
    setIsPending(true)
    try {
      const result = await getAllSocialOrganizations({
        departmentId: selectedDepartment || undefined,
        employeeId: selectedEmployee || undefined,
        search: searchQuery || undefined,
      })
      if (result.success && result.data) {
        setSocialOrganizations(result.data)
      }
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchSocialOrganizations()
    }
  }, [selectedDepartment, selectedEmployee, searchQuery, mounted])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSocialOrganizations()
  }

  if (!mounted) return null

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null
    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) return null
    return format(parsed, "d MMMM yyyy", { locale: id })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <UsersOrgIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">Data Organisasi Kemasyarakatan</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Rekapitulasi keaktifan pegawai pada organisasi sosial, profesi, dan masyarakat
            </p>
          </div>
        </div>
        {isUnitScoped && lockedDepartmentName && (
          <Badge variant="secondary" className="w-fit text-xs">
            Unit: {lockedDepartmentName}
          </Badge>
        )}
      </div>

      {userRole !== "PEGAWAI" && (
        <Card className="border border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filter Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama pegawai, organisasi, atau jabatan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button type="submit" className="shrink-0">Cari</Button>
              </form>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Unit / Departemen
                  </label>
                  {isUnitScoped ? (
                    <div className="px-3 py-2 border rounded-md bg-muted/50 text-sm text-muted-foreground">
                      {lockedDepartmentName ?? (departments.length > 0 ? departments[0].name : "-")}
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
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Pegawai
                  </label>
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
                    placeholder="Semua Pegawai"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-border/70 shadow-xs overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Organisasi Kemasyarakatan</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Informasi organisasi dan jabatan yang diikuti oleh pegawai
              </CardDescription>
            </div>
            <Badge variant="secondary" className="w-fit text-xs font-medium px-2.5 py-1">
              {socialOrganizations.length} Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {isPending ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : socialOrganizations.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-border/80 bg-muted/20">
              <UsersOrgIcon className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-foreground">Tidak ada data organisasi kemasyarakatan</p>
              <p className="text-xs text-muted-foreground mt-1">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {socialOrganizations.map((org) => {
                const orgName = cleanDisplayText(org.organizationName)
                const orgAddress = cleanDisplayText(org.organizationAddress)
                const position = cleanDisplayText(org.position)
                const formattedDate = formatDate(org.joinDate)

                return (
                  <div
                    key={org.id}
                    className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 hover:border-primary/30 hover:shadow-xs transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground leading-snug break-words">
                          {orgName || "Nama organisasi belum diisi"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Link
                            href={`/pegawai/${org.employee.id}?tab=data-organisasi-kemasyarakatan`}
                            className="inline-flex items-center gap-1.5 font-medium text-foreground/85 hover:text-primary transition-colors"
                          >
                            <User className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                            <span>{org.employee.fullName}</span>
                          </Link>
                          <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                            {org.employee.employeeIdNumber}
                          </span>
                          {org.employee.department?.name && (
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="h-3 w-3 shrink-0" />
                              <span>{org.employee.department.name}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {position && (
                        <Badge
                          variant="secondary"
                          className="w-fit inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/15 px-2.5 py-0.5 shrink-0"
                        >
                          <Briefcase className="h-3 w-3 shrink-0" />
                          <span>{position}</span>
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3.5 pt-3.5 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                          <span>Tanggal Bergabung</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">
                          {formattedDate ?? <span className="text-muted-foreground/70 font-normal italic">Belum diisi</span>}
                        </p>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                          <span>Alamat Organisasi</span>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed break-words">
                          {orgAddress || <span className="text-muted-foreground/70 italic">Belum diisi</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
