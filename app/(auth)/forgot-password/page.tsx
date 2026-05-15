"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"

const schema = z.object({
  identifier: z.string().min(1, "NIP atau Email wajib diisi"),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: data.identifier }),
      })
      if (res.ok) {
        setSent(true)
        toast.success("Link reset dikirim! (cek console server)")
      } else {
        const json = await res.json()
        toast.error(json.message || "Gagal mengirim link reset")
      }
    } catch {
      toast.error("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Login
        </Link>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
            <Mail className="h-6 w-6 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Lupa Password?</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Masukkan NIP atau email Anda. Link reset password akan ditampilkan di console server.
          </p>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-semibold text-foreground">Link Terkirim!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Link reset password telah dicetak di console server.
              </p>
              <Link href="/login">
                <Button className="mt-4 w-full" variant="outline">Kembali ke Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>NIP / Email</Label>
                <Input
                  placeholder="Masukkan NIP atau Email"
                  {...register("identifier")}
                  className={errors.identifier ? "border-destructive" : ""}
                />
                {errors.identifier && (
                  <p className="text-xs text-destructive">{errors.identifier.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim Link Reset
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
