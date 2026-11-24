"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { theme, setTheme } = useTheme()

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")

  const onSubmit = async () => {
    if (!identifier || !password) {
      toast.error("Login Gagal", { description: "NIP/Email dan password wajib diisi." })
      return
    }

    setLoading(true)
    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Login Gagal", {
          description: result.error === "CredentialsSignin"
            ? "NIP/Email atau password tidak valid."
            : result.error,
        })
      } else if (result?.ok) {
        toast.success("Berhasil masuk!")
        router.push("/dashboard")
        router.refresh()
      } else {
        toast.error("Login Gagal", {
          description: "Terjadi kesalahan yang tidak diketahui.",
        })
      }
    } catch (err) {
      console.error("Login error:", err)
      toast.error("Login Gagal", {
        description: "Terjadi kesalahan saat mencoba masuk.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-background p-4 sm:p-6 lg:p-8 relative">
      {/* Theme Toggle Button */}
      <div className="w-full flex justify-end max-w-5xl">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-[420px] my-auto">
        <div className="bg-card text-card-foreground border border-border/70 shadow-lg shadow-black/5 dark:shadow-none rounded-2xl p-7 sm:p-9 transition-all">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-5 transition-transform hover:scale-105 duration-200">
              <Image
                src="/icon.png"
                alt="Logo Yayasan Al Wathoniyah Asshodriyah 9"
                fill
                sizes="96px"
                className="object-contain"
                priority
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                SIMKA
              </h1>
              <h2 className="text-base sm:text-lg font-bold text-primary tracking-tight">
                Al Wathoniyah Asshodriyah 9
              </h2>
            </div>

            <div className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground/80">Sistem Informasi Kepegawaian</p>
              <p>Yayasan Al Wathoniyah Asshodriyah 9</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                NIP / Email
              </Label>
              <Input
                id="identifier"
                placeholder="Masukkan NIP atau Email"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-10.5 rounded-lg border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-10.5 rounded-lg border-input bg-background/50 pr-10 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={onSubmit}
              className="w-full h-10.5 mt-2 rounded-lg font-semibold text-sm shadow-sm hover:shadow transition-all"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground/70">
        © {new Date().getFullYear()} Yayasan Al Wathoniyah Asshodriyah 9. All rights reserved.
      </footer>
    </div>
  )
}
