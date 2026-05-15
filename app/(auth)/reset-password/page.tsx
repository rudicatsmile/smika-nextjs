"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Eye, EyeOff, Loader2, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"

const schema = z.object({
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Password tidak cocok",
  path: ["confirm"],
})
type FormData = z.infer<typeof schema>

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      })
      if (res.ok) {
        toast.success("Password berhasil diubah!")
        router.push("/login")
      } else {
        const json = await res.json()
        toast.error(json.message || "Gagal mengubah password")
      }
    } catch {
      toast.error("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-destructive">Token tidak valid atau sudah kadaluarsa.</p>
        <Link href="/login"><Button variant="outline" className="mt-4">Kembali ke Login</Button></Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Password Baru</Label>
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            placeholder="Minimal 6 karakter"
            {...register("password")}
            className={errors.password ? "border-destructive pr-10" : "pr-10"}
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Konfirmasi Password</Label>
        <Input
          type="password"
          placeholder="Ulangi password baru"
          {...register("confirm")}
          className={errors.confirm ? "border-destructive" : ""}
        />
        {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Ubah Password
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Login
        </Link>
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
          <p className="text-muted-foreground text-sm mb-6">Masukkan password baru Anda.</p>
          <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
