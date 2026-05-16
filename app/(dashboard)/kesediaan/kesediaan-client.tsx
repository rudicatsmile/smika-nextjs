"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { CheckCircle, Building2, User, Loader2, Search, Calendar, FileText, Image as ImageIcon, X } from "lucide-react"
import { getEmployeesWithKesediaanStatus } from "@/server/actions/kesediaan"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { KesediaanFormDialog } from "@/components/kesediaan/kesediaan-form-dialog"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  RadioGroup, RadioGroupItem,
} from "@/components/ui/radio-group"
import { canSubmitKesediaan, canEditKesediaan } from "@/lib/rbac"
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
  kesediaan?: Array<{
    id: string
    tanggal: Date
    isBersedia: boolean
    alasanKesanggupan: string | null
    kesediaanHariKerja: string | null
    photo: string | null
  }>
}

export function KesediaanClient({
  departments,
  employees: initialEmployees,
}: {
  departments: Department[]
  employees: Employee[]
}) {
  const { data: session } = useSession()
  const role = session?.user?.role as Role | undefined
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [kesediaanStatusFilter, setKesediaanStatusFilter] = useState<"all" | "bersedia" | "tidak_bersedia">("all")
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(initialEmployees)
  const [isPending, setIsPending] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedKesediaan, setSelectedKesediaan] = useState<Employee | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)

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

  const fetchEmployees = async () => {
    setIsPending(true)
    try {
      const result = await getEmployeesWithKesediaanStatus({
        departmentId: selectedDepartment || undefined,
        search: searchQuery || undefined,
        kesediaanStatus: kesediaanStatusFilter,
      })
      if (result.success) setEmployees(result.data)
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchEmployees()
    }
  }, [selectedDepartment, searchQuery, kesediaanStatusFilter, mounted])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchEmployees()
  }

  const handleOpenDialog = (employee: Employee) => {
    setSelectedKesediaan(employee)
    setDialogOpen(true)
  }

  const handleViewPhoto = (photoUrl: string) => {
    setPhotoPreviewUrl(photoUrl)
    setPhotoPreviewOpen(true)
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Form Kesediaan Pegawai</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          {role !== "PEGAWAI" ? (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama atau NIP..."
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
                  <label className="text-sm font-medium mb-2 block">Status Kesediaan</label>
                  <RadioGroup value={kesediaanStatusFilter} onValueChange={(v: "all" | "bersedia" | "tidak_bersedia") => setKesediaanStatusFilter(v)}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">Semua</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bersedia" id="bersedia" />
                        <Label htmlFor="bersedia">Bersedia</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tidak_bersedia" id="tidak_bersedia" />
                        <Label htmlFor="tidak_bersedia">Tidak Bersedia</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Menampilkan data kesediaan Anda sendiri</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pegawai</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data pegawai
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((emp) => {
                const latestKesediaan = emp.kesediaan && emp.kesediaan.length > 0 ? emp.kesediaan[0] : null
                return (
                  <div key={emp.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{emp.fullName}</span>
                          <span className="text-muted-foreground/60">•</span>
                          <span className="font-mono text-xs">{emp.employeeIdNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{emp.department.name}</span>
                        </div>
                        {latestKesediaan && (
                          <div className="border-t pt-2 mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">Tanggal:</span>
                              <span>{new Date(latestKesediaan.tanggal).toLocaleDateString('id-ID')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant={latestKesediaan.isBersedia ? "default" : "destructive"}>
                                {latestKesediaan.isBersedia ? "Bersedia" : "Tidak Bersedia"}
                              </Badge>
                            </div>
                            {latestKesediaan.kesediaanHariKerja && (
                              <div className="text-sm text-muted-foreground">
                                Hari Kerja: {latestKesediaan.kesediaanHariKerja}
                              </div>
                            )}
                            {latestKesediaan.photo && (
                              <div className="flex items-center gap-2 text-sm">
                                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 text-blue-600 hover:text-blue-700"
                                  onClick={() => handleViewPhoto(latestKesediaan.photo!)}
                                >
                                  Lihat Photo
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {role && (canSubmitKesediaan(role) || canEditKesediaan(role)) && (
                        <Button onClick={() => handleOpenDialog(emp)} size="sm">
                          {latestKesediaan ? "Update" : "Isi Form"}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <KesediaanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={selectedKesediaan}
        onSuccess={fetchEmployees}
      />

      <Dialog open={photoPreviewOpen} onOpenChange={setPhotoPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Photo Kesediaan</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPhotoPreviewOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            {photoPreviewUrl && (
              <img
                src={photoPreviewUrl}
                alt="Photo Kesediaan"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
