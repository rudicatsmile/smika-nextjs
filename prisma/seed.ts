import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"

const dbUrl = process.env["DATABASE_URL"] ?? "file:./dev.db"
const filePath = dbUrl.replace(/^file:/, "")
const resolvedDb = path.isAbsolute(filePath)
  ? filePath
  : path.resolve(process.cwd(), filePath)
const adapter = new PrismaBetterSqlite3({ url: resolvedDb })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  // ── Master: Departments ──────────────────────────────────────────────────
  const deptData = [
    { code: "YAYASAN", name: "Yayasan", description: "Pengurus Yayasan Al Wathoniyah 9" },
    { code: "TU", name: "Tata Usaha", description: "Staff administrasi dan tata usaha" },
    { code: "TK", name: "TK Al Wathoniyah", description: "Taman Kanak-kanak" },
    { code: "MI", name: "MI Al Wathoniyah", description: "Madrasah Ibtidaiyah" },
    { code: "MTS", name: "MTs Al Wathoniyah", description: "Madrasah Tsanawiyah" },
    { code: "MA", name: "MA Al Wathoniyah", description: "Madrasah Aliyah" },
  ]
  const departments: Record<string, string> = {}
  for (const d of deptData) {
    const dept = await prisma.department.upsert({
      where: { code: d.code }, update: {}, create: d,
    })
    departments[d.code] = dept.id
  }
  console.log("✅ Departments seeded")

  // ── Master: Positions ────────────────────────────────────────────────────
  const positionNames = ["Kepala Sekolah", "Wakil Kepala Sekolah", "Guru", "Guru BK",
    "Staff Tata Usaha", "Bendahara", "Pustakawan", "Operator", "Satpam", "Penjaga Sekolah"]
  const positions: Record<string, string> = {}
  for (const name of positionNames) {
    const pos = await prisma.position.upsert({
      where: { name }, update: {}, create: { name },
    })
    positions[name] = pos.id
  }
  console.log("✅ Positions seeded")

  // ── Master: Employment Status ─────────────────────────────────────────────
  const statusNames = ["PNS", "PPPK", "Guru Tetap Yayasan", "Honorer", "Kontrak", "Magang"]
  const employmentStatuses: Record<string, string> = {}
  for (const name of statusNames) {
    const s = await prisma.employmentStatusMaster.upsert({
      where: { name }, update: {}, create: { name },
    })
    employmentStatuses[name] = s.id
  }
  console.log("✅ Employment statuses seeded")

  // ── Master: Religions ─────────────────────────────────────────────────────
  const religionNames = ["Islam", "Kristen Protestan", "Kristen Katolik", "Hindu", "Buddha", "Konghucu"]
  const religions: Record<string, string> = {}
  for (const name of religionNames) {
    const r = await prisma.religion.upsert({ where: { name }, update: {}, create: { name } })
    religions[name] = r.id
  }
  console.log("✅ Religions seeded")

  // ── Master: Blood Types ───────────────────────────────────────────────────
  const bloodTypeNames = ["A", "B", "AB", "O", "A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"]
  const bloodTypes: Record<string, string> = {}
  for (const name of bloodTypeNames) {
    const b = await prisma.bloodType.upsert({ where: { name }, update: {}, create: { name } })
    bloodTypes[name] = b.id
  }
  console.log("✅ Blood types seeded")

  // ── Dummy Employees ──────────────────────────────────────────────────────
  const employeeData = [
    { nip: "197501012005011001", name: "Drs. H. Ahmad Fauzi, M.Pd.", dept: "MTS", pos: "Kepala Sekolah", status: "PNS", gender: "LAKI_LAKI", dob: "1975-01-01", edu: "S2", major: "Manajemen Pendidikan", join: "2005-01-01" },
    { nip: "198203052010012002", name: "Siti Aisyah, S.Pd.", dept: "MA", pos: "Guru", status: "Guru Tetap Yayasan", gender: "PEREMPUAN", dob: "1982-03-05", edu: "S1", major: "Pendidikan Bahasa Arab", join: "2010-01-01" },
    { nip: "199004122015011003", name: "Muhammad Rizki Hidayat, S.Pd.I.", dept: "MI", pos: "Guru", status: "Honorer", gender: "LAKI_LAKI", dob: "1990-04-12", edu: "S1", major: "Pendidikan Agama Islam", join: "2015-07-01" },
    { nip: "198706082012012004", name: "Fatimah Zahra, S.Kom.", dept: "TU", pos: "Operator", status: "Kontrak", gender: "PEREMPUAN", dob: "1987-06-08", edu: "S1", major: "Sistem Informasi", join: "2012-01-01" },
    { nip: "198501152008011005", name: "Abdul Wahab, S.Ag.", dept: "MA", pos: "Kepala Sekolah", status: "PNS", gender: "LAKI_LAKI", dob: "1985-01-15", edu: "S1", major: "Pendidikan Islam", join: "2008-01-01" },
    { nip: "199208302018012006", name: "Nurul Hidayah, S.Pd.", dept: "TK", pos: "Guru", status: "Honorer", gender: "PEREMPUAN", dob: "1992-08-30", edu: "S1", major: "PAUD", join: "2018-01-01" },
    { nip: "197911252003011007", name: "H. Mochammad Soleh, M.Ag.", dept: "YAYASAN", pos: "Bendahara", status: "PNS", gender: "LAKI_LAKI", dob: "1979-11-25", edu: "S2", major: "Hukum Islam", join: "2003-01-01" },
    { nip: "198809142014012008", name: "Dewi Rahmawati, S.E.", dept: "TU", pos: "Bendahara", status: "Guru Tetap Yayasan", gender: "PEREMPUAN", dob: "1988-09-14", edu: "S1", major: "Akuntansi", join: "2014-06-01" },
    { nip: "199503172020011009", name: "Fathur Rahman, S.Pd.", dept: "MTS", pos: "Guru", status: "Honorer", gender: "LAKI_LAKI", dob: "1995-03-17", edu: "S1", major: "Pendidikan Matematika", join: "2020-07-01" },
    { nip: "198410022009012010", name: "Khadijah Nur Azizah, S.Pd.I.", dept: "MI", pos: "Guru", status: "PNS", gender: "PEREMPUAN", dob: "1984-10-02", edu: "S1", major: "Pendidikan Guru MI", join: "2009-01-01" },
    { nip: "199101052016011011", name: "Ridwan Maulana, S.T.", dept: "TU", pos: "Operator", status: "Kontrak", gender: "LAKI_LAKI", dob: "1991-01-05", edu: "S1", major: "Teknik Informatika", join: "2016-01-01" },
    { nip: "198612202011012012", name: "Umi Kulsum, S.Pd.", dept: "TK", pos: "Wakil Kepala Sekolah", status: "Guru Tetap Yayasan", gender: "PEREMPUAN", dob: "1986-12-20", edu: "S1", major: "PGSD", join: "2011-01-01" },
    { nip: "197808192002011013", name: "H. Zainal Abidin, S.H., M.H.", dept: "YAYASAN", pos: "Kepala Sekolah", status: "PNS", gender: "LAKI_LAKI", dob: "1978-08-19", edu: "S2", major: "Hukum", join: "2002-01-01" },
    { nip: "199409272019012014", name: "Laila Fitria, S.Pd.", dept: "MA", pos: "Guru", status: "PPPK", gender: "PEREMPUAN", dob: "1994-09-27", edu: "S1", major: "Pendidikan Kimia", join: "2019-01-01" },
    { nip: "199706012022011015", name: "Andrean Putra Wijaya, S.Pd.", dept: "MTS", pos: "Guru BK", status: "Honorer", gender: "LAKI_LAKI", dob: "1997-06-01", edu: "S1", major: "Bimbingan Konseling", join: "2022-01-01" },
    { nip: "198302112006012016", name: "Mariam Al-Jufri, S.Pd.I.", dept: "MI", pos: "Guru", status: "PNS", gender: "PEREMPUAN", dob: "1983-02-11", edu: "S1", major: "Pendidikan Guru MI", join: "2006-01-01" },
    { nip: "199012082017011017", name: "Syamsul Bahri, S.Kom.", dept: "TU", pos: "Staff Tata Usaha", status: "Kontrak", gender: "LAKI_LAKI", dob: "1990-12-08", edu: "S1", major: "Ilmu Komputer", join: "2017-01-01" },
    { nip: "198507302013012018", name: "Nur Hasanah, A.Md.", dept: "TU", pos: "Pustakawan", status: "Guru Tetap Yayasan", gender: "PEREMPUAN", dob: "1985-07-30", edu: "D3", major: "Perpustakaan", join: "2013-01-01" },
    { nip: "199311192021011019", name: "Iqbal Maulana, S.Pd.", dept: "MA", pos: "Guru", status: "Honorer", gender: "LAKI_LAKI", dob: "1993-11-19", edu: "S1", major: "Pendidikan Fisika", join: "2021-01-01" },
    { nip: "200001102024012020", name: "Anisa Rachma Putri, S.Pd.", dept: "TK", pos: "Guru", status: "Honorer", gender: "PEREMPUAN", dob: "2000-01-10", edu: "S1", major: "PAUD", join: "2024-01-01" },
    { nip: "197602281999011021", name: "Drs. Bambang Sugiarto", dept: "YAYASAN", pos: "Kepala Sekolah", status: "PNS", gender: "LAKI_LAKI", dob: "1976-02-28", edu: "S1", major: "Administrasi Pendidikan", join: "1999-01-01" },
    { nip: "199804162023012022", name: "Nadia Putri Salsabila, S.Pd.", dept: "MTS", pos: "Guru", status: "Honorer", gender: "PEREMPUAN", dob: "1998-04-16", edu: "S1", major: "Pendidikan Bahasa Indonesia", join: "2023-07-01" },
    { nip: "198908252015011023", name: "Hendra Kurniawan, S.Pd.", dept: "MI", pos: "Wakil Kepala Sekolah", status: "Guru Tetap Yayasan", gender: "LAKI_LAKI", dob: "1989-08-25", edu: "S1", major: "PGSD", join: "2015-01-01" },
    { nip: "199207132018012024", name: "Rohimah, S.Pd.I.", dept: "TK", pos: "Kepala Sekolah", status: "Guru Tetap Yayasan", gender: "PEREMPUAN", dob: "1992-07-13", edu: "S1", major: "PAUD", join: "2018-01-01" },
    { nip: "196902151994011025", name: "H. Mursyid Fathullah, M.M.", dept: "YAYASAN", pos: "Bendahara", status: "PNS", gender: "LAKI_LAKI", dob: "1969-02-15", edu: "S2", major: "Manajemen", join: "1994-01-01" },
  ]

  const employees: Record<string, string> = {}
  for (const e of employeeData) {
    const emp = await prisma.employee.upsert({
      where: { employeeIdNumber: e.nip },
      update: {},
      create: {
        employeeIdNumber: e.nip,
        fullName: e.name,
        departmentId: departments[e.dept],
        positionId: positions[e.pos] ?? null,
        employmentStatusId: employmentStatuses[e.status] ?? null,
        religionId: religions["Islam"],
        bloodTypeId: bloodTypes["A"],
        gender: e.gender as any,
        maritalStatus: "MENIKAH",
        employmentStatus: "AKTIF",
        dateOfBirth: new Date(e.dob),
        joinDate: new Date(e.join),
        highestEducation: e.edu,
        major: e.major,
        institutionName: "Universitas Islam Negeri Jakarta",
        graduationYear: parseInt(e.join.slice(0, 4)) - 3,
        placeOfBirth: "Jakarta",
        province: "DKI Jakarta",
        address: `Jl. Condet Raya No. ${Math.floor(Math.random() * 100) + 1}, Jakarta Timur`,
        postalCode: "13760",
        phoneNumber: `0812${Math.floor(Math.random() * 90000000) + 10000000}`,
        email: `${e.nip.slice(-4)}@alwathoniyah9.sch.id`,
      },
    })
    employees[e.nip] = emp.id
  }
  console.log(`✅ ${employeeData.length} employees seeded`)

  // ── Users ────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash("admin123", 12)

  await prisma.user.upsert({
    where: { email: "admin@alwathoniyah9.sch.id" },
    update: {},
    create: {
      name: "Super Administrator",
      email: "admin@alwathoniyah9.sch.id",
      nip: "ADMIN001",
      passwordHash: hash,
      role: "SUPER_ADMIN",
    },
  })

  await prisma.user.upsert({
    where: { email: "hr@alwathoniyah9.sch.id" },
    update: {},
    create: {
      name: "Staff HR Kepegawaian",
      email: "hr@alwathoniyah9.sch.id",
      nip: "197501012005011001",
      passwordHash: hash,
      role: "HR",
      employeeId: employees["197501012005011001"],
    },
  })

  await prisma.user.upsert({
    where: { email: "pimpinan@alwathoniyah9.sch.id" },
    update: {},
    create: {
      name: "H. Zainal Abidin, S.H., M.H.",
      email: "pimpinan@alwathoniyah9.sch.id",
      nip: "197808192002011013",
      passwordHash: hash,
      role: "PIMPINAN",
      employeeId: employees["197808192002011013"],
    },
  })

  await prisma.user.upsert({
    where: { email: "pegawai@alwathoniyah9.sch.id" },
    update: {},
    create: {
      name: "Siti Aisyah, S.Pd.",
      email: "pegawai@alwathoniyah9.sch.id",
      nip: "198203052010012002",
      passwordHash: hash,
      role: "PEGAWAI",
      employeeId: employees["198203052010012002"],
    },
  })

  console.log("✅ Users seeded")
  console.log("\n🎉 Seed selesai!")
  console.log("─────────────────────────────")
  console.log("Demo credentials (semua password: admin123):")
  console.log("  Super Admin : admin@alwathoniyah9.sch.id")
  console.log("  HR          : hr@alwathoniyah9.sch.id  | NIP: 197501012005011001")
  console.log("  Pimpinan    : pimpinan@alwathoniyah9.sch.id")
  console.log("  Pegawai     : pegawai@alwathoniyah9.sch.id")
  console.log("─────────────────────────────\n")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
