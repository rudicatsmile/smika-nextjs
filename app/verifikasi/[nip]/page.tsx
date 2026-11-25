import { prisma } from "@/lib/prisma"
import { CheckCircle2, XCircle, ShieldCheck, Building2, Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<string, string> = {
  AKTIF: "Pegawai Aktif",
  NON_AKTIF: "Non-Aktif",
  CUTI: "Sedang Cuti",
  PENSIUN: "Pensiun",
}

export default async function VerifikasiKartuPage({
  params,
}: {
  params: Promise<{ nip: string }>
}) {
  const { nip } = await params
  const decodedNip = decodeURIComponent(nip)

  const [employee, appConfig] = await Promise.all([
    prisma.employee.findFirst({
      where: {
        OR: [{ employeeIdNumber: decodedNip }, { id: decodedNip }],
      },
      select: {
        id: true,
        fullName: true,
        employeeIdNumber: true,
        profilePhoto: true,
        employmentStatus: true,
        isBlocked: true,
        department: { select: { name: true } },
        position: { select: { name: true } },
      },
    }),
    prisma.appConfiguration.findFirst({
      select: { appName: true, appOwner: true, logoUrl: true },
    }),
  ])

  const orgName = appConfig?.appOwner || appConfig?.appName || "SIMKA9"
  const isVerifiedActive =
    Boolean(employee) &&
    !employee?.isBlocked &&
    employee?.employmentStatus === "AKTIF"

  const initials = employee?.fullName
    ? employee.fullName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center gap-3">
          {appConfig?.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={appConfig.logoUrl}
              alt={orgName}
              className="h-9 w-9 object-contain rounded bg-white p-0.5"
            />
          )}
          <div className="min-w-0">
            <p className="text-xs text-slate-300 uppercase tracking-wider">
              Verifikasi Kartu Pegawai
            </p>
            <h1 className="text-sm font-bold truncate">{orgName}</h1>
          </div>
        </div>

        <CardContent className="p-6 space-y-5">
          {!employee ? (
            <div className="text-center py-6 space-y-3">
              <XCircle className="h-14 w-14 text-red-500 mx-auto" />
              <div>
                <h2 className="text-lg font-bold text-red-600">Data Tidak Ditemukan</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Kartu pegawai dengan kode <span className="font-mono">{decodedNip}</span> tidak terdaftar dalam sistem.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
                {isVerifiedActive ? (
                  <CheckCircle2 className="h-7 w-7 text-green-600 flex-shrink-0" />
                ) : (
                  <ShieldCheck className="h-7 w-7 text-amber-600 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold">
                    {isVerifiedActive
                      ? "Kartu Pegawai Terverifikasi Aktif"
                      : "Status Pegawai Tidak Aktif"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Status kepegawaian: {STATUS_LABEL[employee.employmentStatus] ?? employee.employmentStatus}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                <Avatar className="h-24 w-24 border-2 border-primary/20 shadow">
                  {employee.profilePhoto && (
                    <AvatarImage src={employee.profilePhoto} alt={employee.fullName} className="object-cover" />
                  )}
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="text-xl font-bold">{employee.fullName}</h2>
                  <Badge variant="secondary" className="mt-1 font-mono">
                    NIP: {employee.employeeIdNumber}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Jabatan:</span>
                  <span className="font-medium ml-auto text-right">
                    {employee.position?.name ?? "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Unit / Lembaga:</span>
                  <span className="font-medium ml-auto text-right">
                    {employee.department?.name ?? "-"}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
