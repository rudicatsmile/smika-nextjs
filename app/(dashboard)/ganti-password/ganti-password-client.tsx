"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react"
import { toast } from "sonner"
import { changePassword } from "@/server/actions/akun"
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"
import { cn } from "@/lib/utils"

interface UserProps {
  id?: string
  name?: string | null
  email?: string | null
  nip?: string | null
  role?: string
}

export function GantiPasswordClient({ user }: { user: UserProps }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Toggle show/hide password
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Status submission
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const initials = user.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  const roleLabel = user.role
    ? ROLE_LABELS[user.role as Role] ?? user.role
    : "Pengguna"

  const roleColor = user.role
    ? ROLE_COLORS[user.role as Role] || "bg-primary/10 text-primary"
    : "bg-muted text-muted-foreground"

  // Live validation checks
  const isMinLength = newPassword.length >= 8
  const isDifferentFromCurrent = newPassword.length > 0 && currentPassword.length > 0 && newPassword !== currentPassword
  const isMatchesConfirm = confirmPassword.length > 0 && newPassword === confirmPassword
  const isFormValid =
    currentPassword.length > 0 &&
    isMinLength &&
    (currentPassword.length === 0 || isDifferentFromCurrent) &&
    isMatchesConfirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!currentPassword) {
      setErrorMsg("Password saat ini wajib diisi")
      return
    }

    if (newPassword.length < 8) {
      setErrorMsg("Password baru minimal 8 karakter")
      return
    }

    if (newPassword === currentPassword) {
      setErrorMsg("Password baru tidak boleh sama dengan password lama")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password baru tidak cocok")
      return
    }

    startTransition(async () => {
      try {
        const result = await changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        })

        if (result.success) {
          setIsSuccess(true)
          toast.success("Password Anda berhasil diganti!", {
            description: "Gunakan kata sandi baru ini untuk login berikutnya.",
          })
          // Reset form fields
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
        } else {
          setErrorMsg(result.error || "Gagal mengganti password")
          toast.error(result.error || "Gagal mengganti password")
        }
      } catch {
        setErrorMsg("Terjadi kesalahan sistem. Silakan coba kembali.")
        toast.error("Terjadi kesalahan sistem")
      }
    })
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Tombol Kembali */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 -ml-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali</span>
        </Button>
      </div>

      {/* Kartu Profil Pengguna Singkat */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-11 w-11 rounded-xl border border-border flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm rounded-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-bold text-sm text-foreground truncate">{user.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border border-current/20 inline-block truncate",
                  roleColor
                )}
              >
                {roleLabel}
              </span>
              {user.nip && (
                <span className="text-[11px] text-muted-foreground font-mono truncate">
                  {user.nip}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex-shrink-0">
          <ShieldCheck className="h-4 w-4" />
          <span className="font-medium">Akun Terverifikasi</span>
        </div>
      </div>

      {/* Kartu Formulir Ganti Password */}
      <Card className="rounded-2xl border-border shadow-xs overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 shadow-2xs">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                Ganti Kata Sandi (Password)
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Pastikan kata sandi baru Anda kuat dan mudah diingat oleh Anda sendiri.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {isSuccess ? (
          /* Tampilan Berhasil */
          <CardContent className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-foreground">
                Password Berhasil Diperbarui!
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                Kata sandi baru Anda telah aktif secara instan dengan enkripsi bcrypt yang aman.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSuccess(false)}
                className="rounded-xl text-xs h-9"
              >
                Ganti Lagi
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="rounded-xl text-xs h-9 gap-1.5 shadow-xs"
              >
                <span>Kembali ke Dashboard</span>
              </Button>
            </div>
          </CardContent>
        ) : (
          /* Form Input */
          <form onSubmit={handleSubmit}>
            <CardContent className="p-5 sm:p-6 space-y-4">
              {/* Pesan Kesalahan */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{errorMsg}</span>
                </div>
              )}

              {/* 1. Password Lama */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-semibold text-foreground">
                  Password Saat Ini (Lama)
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    placeholder="Masukkan kata sandi lama Anda"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value)
                      if (errorMsg) setErrorMsg(null)
                    }}
                    required
                    disabled={isPending}
                    className="pr-10 h-10 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    title={showCurrent ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 2. Password Baru */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="newPassword" className="text-xs font-semibold text-foreground">
                  Password Baru
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNew ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (errorMsg) setErrorMsg(null)
                    }}
                    required
                    disabled={isPending}
                    className="pr-10 h-10 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    title={showNew ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 3. Konfirmasi Password Baru */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                  Konfirmasi Password Baru
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errorMsg) setErrorMsg(null)
                    }}
                    required
                    disabled={isPending}
                    className="pr-10 h-10 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    title={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Checklist Validasi Keamanan Realtime */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Ketentuan Kata Sandi:
                </p>
                <div className="space-y-1.5 bg-muted/30 p-3 rounded-xl border border-border/70 text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                        isMinLength
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isMinLength ? <Check className="h-2.5 w-2.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <span
                      className={cn(
                        "text-[11px]",
                        isMinLength ? "text-foreground font-medium" : "text-muted-foreground"
                      )}
                    >
                      Minimal 8 karakter
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                        isDifferentFromCurrent
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isDifferentFromCurrent ? <Check className="h-2.5 w-2.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <span
                      className={cn(
                        "text-[11px]",
                        isDifferentFromCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                      )}
                    >
                      Berbeda dari kata sandi saat ini
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                        isMatchesConfirm
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isMatchesConfirm ? <Check className="h-2.5 w-2.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <span
                      className={cn(
                        "text-[11px]",
                        isMatchesConfirm ? "text-foreground font-medium" : "text-muted-foreground"
                      )}
                    >
                      Konfirmasi kata sandi cocok
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Footer & Tombol Submit */}
            <CardFooter className="px-5 py-4 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto text-xs order-2 sm:order-1"
              >
                Batal
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isPending || !isFormValid}
                className="w-full sm:w-auto h-10 px-5 text-xs font-semibold gap-2 rounded-xl shadow-xs order-1 sm:order-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Simpan Password Baru</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
