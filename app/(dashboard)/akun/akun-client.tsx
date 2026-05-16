"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, MoreHorizontal, Key, Shield, UserX, UserCheck, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createUser, updateUserRole, toggleUserActive, resetUserPassword, deleteUser } from "@/server/actions/akun"
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface User {
  id: string; name: string; email?: string | null; nip?: string | null
  role: Role; isActive: boolean; createdAt: Date | string; employeeId?: string | null
  employee?: { fullName: string; department?: { name: string } | null } | null
}
interface UnlinkedEmployee { id: string; fullName: string; employeeIdNumber: string }

export function AkunClient({ users, unlinkedEmployees }: { users: User[]; unlinkedEmployees: UnlinkedEmployee[] }) {
  const [addOpen, setAddOpen] = useState(false)
  const [resetId, setResetId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: "", email: "", nip: "", password: "", role: "PEGAWAI" as Role, employeeId: "" })
  const [newPass, setNewPass] = useState("")

  const handleAdd = () => {
    startTransition(async () => {
      const result = await createUser({
        name: form.name, email: form.email || undefined,
        nip: form.nip || undefined, password: form.password,
        role: form.role, employeeId: form.employeeId || undefined,
      })
      if (result.error) toast.error(result.error)
      else { toast.success("Akun berhasil dibuat"); setAddOpen(false); setForm({ name: "", email: "", nip: "", password: "", role: "PEGAWAI", employeeId: "" }) }
    })
  }

  const handleRoleChange = (id: string, role: Role) => {
    startTransition(async () => {
      const result = await updateUserRole(id, role)
      if (result.error) toast.error(result.error)
      else toast.success("Role diperbarui")
    })
  }

  const handleToggleActive = (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await toggleUserActive(id, !current)
      if (result.error) toast.error(result.error)
      else toast.success(current ? "Akun dinonaktifkan" : "Akun diaktifkan")
    })
  }

  const handleResetPassword = () => {
    if (!resetId || !newPass) return
    startTransition(async () => {
      const result = await resetUserPassword(resetId, newPass)
      if (result.error) toast.error(result.error)
      else { toast.success("Password berhasil direset"); setResetId(null); setNewPass("") }
    })
  }

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      const result = await deleteUser(deleteId)
      if (result.error) toast.error(result.error)
      else { toast.success("Akun dihapus"); setDeleteId(null) }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />Tambah Akun
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pengguna</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">NIP / Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Dibuat</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {user.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          {user.employee && (
                            <p className="text-xs text-muted-foreground">{user.employee.department?.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm font-mono">{user.nip || "-"}</p>
                      <p className="text-xs text-muted-foreground">{user.email || "-"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleRoleChange(user.id, v as Role)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-7 text-xs w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={user.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-muted text-muted-foreground"}
                      >
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "d MMM yyyy", { locale: id })}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setResetId(user.id)}>
                            <Key className="mr-2 h-4 w-4" />Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(user.id, user.isActive)}>
                            {user.isActive
                              ? <><UserX className="mr-2 h-4 w-4" />Nonaktifkan</>
                              : <><UserCheck className="mr-2 h-4 w-4" />Aktifkan</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(user.id)}
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
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!isPending) setAddOpen(o) }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Akun Pengguna</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nama Lengkap <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>NIP</Label>
                <Input value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} placeholder="untuk login NIP" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Password <span className="text-destructive">*</span></Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 karakter" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tautkan ke Pegawai (opsional)</Label>
              <Select value={form.employeeId || "none"} onValueChange={(v) => setForm({ ...form, employeeId: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Pilih pegawai..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Tidak ditautkan —</SelectItem>
                  {unlinkedEmployees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.fullName} ({e.employeeIdNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={isPending}>Batal</Button>
            <Button onClick={handleAdd} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Buat Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetId} onOpenChange={(o) => { if (!o) setResetId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Password Baru</Label>
            <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Min. 6 karakter" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetId(null)}>Batal</Button>
            <Button onClick={handleResetPassword} disabled={isPending || !newPass}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus akun ini?</AlertDialogTitle>
            <AlertDialogDescription>Akun akan dihapus permanen dan tidak dapat dipulihkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
