"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users, UserCheck, UserX, UserPlus, TrendingUp,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface RecentEmployee {
  id: string
  fullName: string
  employeeIdNumber: string
  employmentStatus: string
  createdAt: Date | string
  department?: { name: string } | null
}

interface DashboardStats {
  total: number
  aktif: number
  nonAktif: number
  baruBulanIni: number
  lakiLaki: number
  perempuan: number
  perDepartemen: { name: string; count: number }[]
  perUsia: { bracket: string; count: number }[]
  perStatus: { status: string; count: number }[]
  recentEmployees: RecentEmployee[]
}

const STATUS_COLORS: Record<string, string> = {
  AKTIF: "#166534",
  NON_AKTIF: "#dc2626",
  CUTI: "#ca8a04",
  PENSIUN: "#6b7280",
}

const STATUS_LABELS: Record<string, string> = {
  AKTIF: "Aktif",
  NON_AKTIF: "Non Aktif",
  CUTI: "Cuti",
  PENSIUN: "Pensiun",
}

const GENDER_COLORS = ["#166534", "#ca8a04"]
const PIE_RADIAN = Math.PI / 180

function renderCustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * PIE_RADIAN)
  const y = cy + radius * Math.sin(-midAngle * PIE_RADIAN)
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null
}

export function DashboardClient({ stats }: { stats: DashboardStats }) {
  const kpiCards = [
    { label: "Total Pegawai", value: stats.total, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pegawai Aktif", value: stats.aktif, icon: UserCheck, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    { label: "Non-Aktif / Pensiun", value: stats.nonAktif, icon: UserX, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Baru Bulan Ini", value: stats.baruBulanIni, icon: UserPlus, color: "text-accent", bg: "bg-accent/10" },
  ]

  const genderData = [
    { name: "Laki-laki", value: stats.lakiLaki },
    { name: "Perempuan", value: stats.perempuan },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</p>
                  <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar: Per Departemen */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Distribusi per Departemen / Unit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.perDepartemen} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v} orang`, "Jumlah"]}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie: Gender */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Distribusi Gender</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {genderData.map((_, i) => (
                    <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={10} />
                <Tooltip formatter={(v) => [`${v} orang`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar: Usia */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Distribusi Usia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.perUsia} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="bracket" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} orang`, "Jumlah"]} />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie: Status Kepegawaian */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Status Kepegawaian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.perStatus.map((s) => ({
                    ...s,
                    name: STATUS_LABELS[s.status] ?? s.status,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {stats.perStatus.map((s, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLORS[s.status] ?? `hsl(${i * 60}, 60%, 45%)`}
                    />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={10} />
                <Tooltip formatter={(v) => [`${v} orang`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Employees */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Pegawai Baru Bulan Ini</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentEmployees.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">
              Belum ada pegawai baru bulan ini.
            </p>
          ) : (
            <div className="space-y-2">
              {stats.recentEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                      {emp.fullName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{emp.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {emp.employeeIdNumber}
                        {emp.department && ` · ${emp.department.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        emp.employmentStatus === "AKTIF"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {STATUS_LABELS[emp.employmentStatus] ?? emp.employmentStatus}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {format(new Date(emp.createdAt), "d MMM yyyy", { locale: id })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
