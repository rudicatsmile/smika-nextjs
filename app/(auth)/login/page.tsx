"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, BookOpen, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

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

      console.log("Login result:", result)

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
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
        {/* Geometric Islamic Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="none" stroke="white" strokeWidth="1"/>
                <circle cx="40" cy="40" r="15" fill="none" stroke="white" strokeWidth="1"/>
                <line x1="40" y1="0" x2="40" y2="80" stroke="white" strokeWidth="0.5"/>
                <line x1="0" y1="40" x2="80" y2="40" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic)"/>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
              <span className="text-accent text-2xl font-bold">ع</span>
            </div>
            <div>
              <p className="text-sidebar-foreground/60 text-xs uppercase tracking-widest">Yayasan</p>
              <p className="text-sidebar-foreground font-bold text-lg leading-tight">Al Wathoniyah 9</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-sidebar-foreground leading-tight">
              SIMKA
            </h1>
            <h2 className="text-xl text-sidebar-foreground/80 mt-1">
              Al Wathoniyah Asshodriyah 9
            </h2>
            <p className="text-sidebar-foreground/60 mt-3 text-sm leading-relaxed">
              Sistem Informasi Kepegawaian<br />
              Yayasan Al Wathoniyah Asshodriyah 9
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Users, label: "Data Pegawai", desc: "Kelola seluruh data" },
              { icon: BookOpen, label: "Multi Unit", desc: "TK, MI, MTs, MA" },
              { icon: Shield, label: "Aman & Terpercaya", desc: "Role-based access" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-sidebar-accent/50 rounded-xl p-4 border border-sidebar-border">
                <Icon className="w-5 h-5 text-accent mb-2" />
                <p className="text-sidebar-foreground text-xs font-semibold">{label}</p>
                <p className="text-sidebar-foreground/50 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sidebar-foreground/40 text-xs">
          © {new Date().getFullYear()} Yayasan Al Wathoniyah Asshodriyah 9
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Theme Toggle */}
          <div className="flex justify-end mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-bold">ع</span>
            </div>
            <div>
              <p className="font-bold text-foreground">SIMKA Al Wathoniyah 9</p>
              <p className="text-muted-foreground text-xs">Sistem Informasi Kepegawaian</p>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-foreground">Selamat Datang</h2>
            <p className="text-muted-foreground text-sm">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier">NIP / Email</Label>
              <Input
                id="identifier"
                placeholder="Masukkan NIP atau Email"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
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
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button onClick={onSubmit} className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk
            </Button>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-xl border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Akun Demo:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium">Super Admin:</span> admin@alwathoniyah9.sch.id / admin123</p>
              <p><span className="font-medium">HR:</span> hr@alwathoniyah9.sch.id / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
