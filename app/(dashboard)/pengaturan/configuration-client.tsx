"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Upload, X } from "lucide-react"
import { updateAppConfiguration } from "@/server/actions/app-configuration"

interface ConfigurationData {
  id?: string
  appName: string
  appOwner?: string
  logoUrl?: string
  faviconUrl?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  facebookUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  primaryColor: string
  secondaryColor: string
  motto?: string
  vision?: string
  mission?: string
  copyright?: string
  footerText?: string
  activeYearId?: string
  activeSemester?: number
  activeYear?: {
    id: string
    name: string
  }
}

export function ConfigurationClient({ initialData }: { initialData: ConfigurationData | null }) {
  const [form, setForm] = useState<ConfigurationData>(
    initialData || {
      appName: "SIMKA",
      primaryColor: "#0f172a",
      secondaryColor: "#3b82f6",
    }
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [years, setYears] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetchYears()
  }, [])

  const fetchYears = async () => {
    try {
      const res = await fetch("/api/years")
      const data = await res.json()
      if (data.success) {
        setYears(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch years:", error)
    }
  }

  const handleFileUpload = async (file: File, type: "logo" | "favicon") => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    if (type === "logo") setUploadingLogo(true)
    else setUploadingFavicon(true)

    try {
      const res = await fetch("/api/app-config/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (data.url) {
        setForm({ ...form, [type === "logo" ? "logoUrl" : "faviconUrl"]: data.url })
        toast.success(`${type === "logo" ? "Logo" : "Favicon"} berhasil diupload`)
      } else {
        toast.error(data.message || "Gagal upload file")
      }
    } catch (error) {
      toast.error("Gagal upload file")
    } finally {
      if (type === "logo") setUploadingLogo(false)
      else setUploadingFavicon(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateAppConfiguration(form)
      if (result.success) {
        toast.success("Konfigurasi berhasil disimpan")
      } else {
        toast.error(result.error || "Gagal menyimpan konfigurasi")
      }
    } catch (error) {
      toast.error("Gagal menyimpan konfigurasi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeImage = (type: "logo" | "favicon") => {
    setForm({ ...form, [type === "logo" ? "logoUrl" : "faviconUrl"]: undefined })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Aplikasi</h1>
        <p className="text-muted-foreground">Kelola konfigurasi aplikasi sekolah</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Dasar */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
            <CardDescription>Nama aplikasi dan pemilik</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appName">Nama Aplikasi</Label>
                <Input
                  id="appName"
                  value={form.appName}
                  onChange={(e) => setForm({ ...form, appName: e.target.value })}
                  placeholder="SIMKA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appOwner">Nama Pemilik</Label>
                <Input
                  id="appOwner"
                  value={form.appOwner || ""}
                  onChange={(e) => setForm({ ...form, appOwner: e.target.value })}
                  placeholder="Yayasan Al Wathoniyah 9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Logo, favicon, dan warna tema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                {form.logoUrl ? (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeImage("logo")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, "logo")
                        }}
                      />
                      {uploadingLogo ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      )}
                    </label>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Favicon</Label>
                {form.faviconUrl ? (
                  <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
                    <img src={form.faviconUrl} alt="Favicon" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-5 w-5"
                      onClick={() => removeImage("favicon")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, "favicon")
                        }}
                      />
                      {uploadingFavicon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      )}
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Warna Utama</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    placeholder="#0f172a"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Warna Sekunder</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={form.secondaryColor}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motto">Motto</Label>
              <Input
                id="motto"
                value={form.motto || ""}
                onChange={(e) => setForm({ ...form, motto: e.target.value })}
                placeholder="Motto sekolah"
              />
            </div>
          </CardContent>
        </Card>

        {/* Kontak */}
        <Card>
          <CardHeader>
            <CardTitle>Kontak</CardTitle>
            <CardDescription>Informasi kontak sekolah</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={form.address || ""}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Alamat lengkap sekolah"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+62 xxx xxxx xxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@sekolah.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={form.website || ""}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://sekolah.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Link social media sekolah</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook</Label>
                <Input
                  id="facebookUrl"
                  value={form.facebookUrl || ""}
                  onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/sekolah"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram</Label>
                <Input
                  id="instagramUrl"
                  value={form.instagramUrl || ""}
                  onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/sekolah"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube</Label>
                <Input
                  id="youtubeUrl"
                  value={form.youtubeUrl || ""}
                  onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/sekolah"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visi & Misi */}
        <Card>
          <CardHeader>
            <CardTitle>Visi & Misi</CardTitle>
            <CardDescription>Visi dan misi sekolah</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vision">Visi</Label>
              <Textarea
                id="vision"
                value={form.vision || ""}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                placeholder="Visi sekolah"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mission">Misi</Label>
              <Textarea
                id="mission"
                value={form.mission || ""}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
                placeholder="Misi sekolah"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardHeader>
            <CardTitle>Footer</CardTitle>
            <CardDescription>Teks footer dan copyright</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="copyright">Copyright</Label>
              <Input
                id="copyright"
                value={form.copyright || ""}
                onChange={(e) => setForm({ ...form, copyright: e.target.value })}
                placeholder="© 2024 Yayasan Al Wathoniyah 9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footerText">Teks Footer</Label>
              <Textarea
                id="footerText"
                value={form.footerText || ""}
                onChange={(e) => setForm({ ...form, footerText: e.target.value })}
                placeholder="Teks tambahan di footer"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Akademik */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Akademik</CardTitle>
            <CardDescription>Tahun ajaran dan semester aktif</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activeYearId">Tahun Ajaran Aktif</Label>
                <Select
                  value={form.activeYearId || ""}
                  onValueChange={(value) => setForm({ ...form, activeYearId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun ajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activeSemester">Semester Aktif</Label>
                <Select
                  value={form.activeSemester?.toString() || ""}
                  onValueChange={(value) => setForm({ ...form, activeSemester: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1 (Ganjil)</SelectItem>
                    <SelectItem value="2">Semester 2 (Genap)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Konfigurasi"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
