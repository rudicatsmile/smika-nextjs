"use client"

import { useState, useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Search, Plus, Filter, LayoutGrid, List, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, Upload, Download, MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { deleteEmployee } from "@/server/actions/pegawai"
import { format } from "date-fns"
import { id } from "date-fns/locale"

const STATUS_COLORS: Record<string, string> = {
  AKTIF: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  NON_AKTIF: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  CUTI: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  PENSIUN: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
}
const STATUS_LABELS: Record<string, string> = {
  AKTIF: "Aktif", NON_AKTIF: "Non Aktif", CUTI: "Cuti", PENSIUN: "Pensiun",
}

interface Employee {
  id: string; fullName: string; employeeIdNumber: string
  gender?: string | null; employmentStatus: string; profilePhoto?: string | null
  joinDate?: Date | string | null; email?: string | null; phoneNumber?: string | null
  department?: { id: string; name: string } | null
}
interface Department { id: string; name: string }

interface Props {
  employees: Employee[]
  total: number; page: number; limit: number
  departments: Department[]
  searchQuery: string; deptFilter: string; statusFilter: string
}

export function EmployeeListClient({
  employees, total, page, limit, departments,
  searchQuery, deptFilter, statusFilter,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [search, setSearch] = useState(searchQuery)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const totalPages = Math.ceil(total / limit)

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (deptFilter) params.set("dept", deptFilter)
    if (statusFilter) params.set("status", statusFilter)
    params.set("page", "1")
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ q: search })
  }

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      const res = await deleteEmployee(deleteId)
      if (res.error) toast.error(res.error)
      else toast.success("Pegawai berhasil dihapus")
      setDeleteId(null)
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Data Pegawai</h1>
          <p className="text-muted-foreground text-sm">{total} pegawai ditemukan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/pegawai/import"><Upload className="h-4 w-4 mr-1.5" />Import</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/api/pegawai/export"><Download className="h-4 w-4 mr-1.5" />Export</a>
          </Button>
          <Button size="sm" asChild>
            <Link href="/pegawai/baru"><Plus className="h-4 w-4 mr-1.5" />Tambah Pegawai</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Cari nama, NIP, NIK, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex gap-2">
          <Select
            value={deptFilter || "all"}
            onValueChange={(v) => updateParams({ dept: v === "all" ? "" : v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Semua Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Unit</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => updateParams({ status: v === "all" ? "" : v })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 ${viewMode === "table" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 ${viewMode === "card" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <TableView employees={employees} onDelete={setDeleteId} />
      ) : (
        <CardView employees={employees} onDelete={setDeleteId} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages} ({total} data)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pegawai?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua data pegawai termasuk dokumen dan riwayat akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function TableView({ employees, onDelete }: { employees: Employee[]; onDelete: (id: string) => void }) {
  if (employees.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">Tidak ada pegawai yang ditemukan</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pegawai</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">NIP</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Unit</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Tgl Bergabung</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {emp.profilePhoto && <AvatarImage src={emp.profilePhoto} alt={emp.fullName} />}
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {emp.fullName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{emp.fullName}</p>
                      <p className="text-xs text-muted-foreground">{emp.email ?? emp.phoneNumber ?? "-"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm font-mono">{emp.employeeIdNumber}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm">{emp.department?.name ?? "-"}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {emp.joinDate ? format(new Date(emp.joinDate), "d MMM yyyy", { locale: id }) : "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_COLORS[emp.employmentStatus] ?? "bg-muted"} variant="secondary">
                    {STATUS_LABELS[emp.employmentStatus] ?? emp.employmentStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/pegawai/${emp.id}`}><Eye className="mr-2 h-4 w-4" />Lihat Detail</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/pegawai/${emp.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(emp.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Users(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function CardView({ employees, onDelete }: { employees: Employee[]; onDelete: (id: string) => void }) {
  if (employees.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">Tidak ada pegawai yang ditemukan</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {employees.map((emp) => (
        <Card key={emp.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <Avatar className="h-12 w-12">
                {emp.profilePhoto && <AvatarImage src={emp.profilePhoto} alt={emp.fullName} />}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {emp.fullName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/pegawai/${emp.id}`}><Eye className="mr-2 h-4 w-4" />Lihat Detail</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/pegawai/${emp.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(emp.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Link href={`/pegawai/${emp.id}`} className="hover:underline">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2">{emp.fullName}</h3>
            </Link>
            <p className="text-xs text-muted-foreground font-mono mt-1">{emp.employeeIdNumber}</p>
            {emp.department && (
              <p className="text-xs text-muted-foreground mt-1">{emp.department.name}</p>
            )}
            <div className="mt-3">
              <Badge className={STATUS_COLORS[emp.employmentStatus] ?? "bg-muted"} variant="secondary">
                {STATUS_LABELS[emp.employmentStatus] ?? emp.employmentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
