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
import { FileText, Building2, User, Loader2, Search, Upload, Check, X, AlertCircle } from "lucide-react"
import { getEmployeesWithDocumentStatus } from "@/server/actions/important-document"
import { ImportantDocumentUploadDialog } from "@/components/important-document/important-document-upload-dialog"
import { Role } from "@/app/generated/prisma/enums"

const DOCUMENT_TYPES = [
  { key: "KTP", label: "KTP" },
  { key: "KARTU_KELUARGA", label: "Kartu Keluarga" },
  { key: "IJAZAH", label: "Ijazah" },
  { key: "NPWP", label: "NPWP" },
  { key: "BPJS", label: "BPJS" },
  { key: "SERTIFIKASI_PENDIDIKAN", label: "Sertifikasi Pendidikan" },
  { key: "SK_PENGANGKATAN", label: "SK Pengangkatan" },
]

interface Department {
  id: string
  name: string
}

interface EmployeeWithDocuments {
  id: string
  fullName: string
  employeeIdNumber: string
  department: { id: string; name: string }
  importantDocuments: Array<{
    id: string
    documentType: string
    fileUrl: string
  }>
}

export function DataDokumenPentingClient({
  departments,
  userRole,
}: {
  departments: Department[]
  userRole?: Role
}) {
  const { data: session } = useSession()
  const role = session?.user?.role as Role | undefined
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [documentStatus, setDocumentStatus] = useState<"all" | "uploaded" | "not_uploaded" | "complete">("all")
  const [employees, setEmployees] = useState<EmployeeWithDocuments[]>([])
  const [isPending, setIsPending] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithDocuments | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (userRole === "PIMPINAN" && departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0].id)
    }
  }, [userRole, departments, selectedDepartment])

  const fetchEmployees = async () => {
    setIsPending(true)
    try {
      const result = await getEmployeesWithDocumentStatus({
        departmentId: selectedDepartment || undefined,
        search: searchQuery || undefined,
        documentStatus: documentStatus === "all" ? undefined : documentStatus,
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
  }, [selectedDepartment, searchQuery, documentStatus, mounted])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchEmployees()
  }

  const handleUploadClick = (employee: EmployeeWithDocuments) => {
    setSelectedEmployee(employee)
    setDialogOpen(true)
  }

  const getDocumentStatus = (employee: EmployeeWithDocuments, documentType: string) => {
    const doc = employee.importantDocuments.find(d => d.documentType === documentType)
    return doc
  }

  const getDocumentLabel = (key: string) => {
    const docType = DOCUMENT_TYPES.find(d => d.key === key)
    return docType?.label || key
  }

  const getCompletionPercentage = (employee: EmployeeWithDocuments) => {
    const uploaded = employee.importantDocuments.length
    const total = DOCUMENT_TYPES.length
    return Math.round((uploaded / total) * 100)
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Data Dokumen Penting</h1>
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
                  <label className="text-sm font-medium mb-2 block">Status Dokumen</label>
                  <Select value={documentStatus} onValueChange={(v: any) => setDocumentStatus(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="uploaded">Sudah Diupload</SelectItem>
                      <SelectItem value="not_uploaded">Belum Diupload</SelectItem>
                      <SelectItem value="complete">Lengkap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Menampilkan dokumen penting Anda sendiri</p>
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
              Tidak ada pegawai ditemukan
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{employee.fullName}</h3>
                        <Badge variant="outline">{employee.employeeIdNumber}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{employee.department.name}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {DOCUMENT_TYPES.map((docType) => {
                          const doc = getDocumentStatus(employee, docType.key)
                          return (
                            <Badge 
                              key={docType.key} 
                              variant={doc?.fileUrl ? "default" : "outline"}
                              className={doc?.fileUrl ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {doc?.fileUrl ? <Check className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                              {docType.label}
                            </Badge>
                          )
                        })}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Kelengkapan:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${getCompletionPercentage(employee)}%` }}
                          />
                        </div>
                        <span className="font-medium">{getCompletionPercentage(employee)}%</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleUploadClick(employee)}
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEmployee && (
        <ImportantDocumentUploadDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          employee={selectedEmployee}
        />
      )}
    </div>
  )
}
