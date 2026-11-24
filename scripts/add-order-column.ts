import { prisma } from "../lib/prisma"

interface ColumnInfo {
  Field: string
  Type: string
  Null: string
  Key: string
  Default: any
  Extra: string
}

async function main() {
  console.log("Memeriksa kolom pada tabel Education...")

  // 1. Periksa kolom saat ini
  const columns = (await prisma.$queryRawUnsafe("SHOW COLUMNS FROM Education")) as ColumnInfo[]
  const hasOrder = columns.some((c) => c.Field === "order")

  if (!hasOrder) {
    console.log("Menambahkan kolom 'order' ke tabel Education...")
    await prisma.$executeRawUnsafe("ALTER TABLE Education ADD COLUMN `order` INT NOT NULL DEFAULT 0 AFTER `level`")
    console.log("✔ Kolom 'order' berhasil ditambahkan ke tabel Education")
  } else {
    console.log("✔ Kolom 'order' sudah ada di tabel Education")
  }

  // 2. Ambil seluruh data pendidikan yang ada
  const educations = (await prisma.$queryRawUnsafe("SELECT id, name, level, `order` FROM Education")) as Array<{
    id: string
    name: string
    level: string
    order: number
  }>

  console.log(`Ditemukan ${educations.length} data pendidikan:`)

  // 3. Tentukan urutan logis berjenjang
  // SD -> SMP -> SMA/SMK -> D1 -> D2 -> D3 -> D4 -> S1 -> Profesi -> S2 -> S3
  function getLogicalOrder(name: string, level: string): number {
    const text = `${name} ${level}`.toLowerCase()
    if (text.includes("sd") || text.includes("paket a") || text.includes("dasar")) return 1
    if (text.includes("smp") || text.includes("mts") || text.includes("paket b")) return 2
    if (text.includes("sma") || text.includes("smk") || text.includes("ma") || text.includes("paket c") || text.includes("slta") || text.includes("menengah")) return 3
    if (text.includes("d1") || text.includes("diploma 1") || text.includes("d-1")) return 4
    if (text.includes("d2") || text.includes("diploma 2") || text.includes("d-2")) return 5
    if (text.includes("d3") || text.includes("diploma 3") || text.includes("d-3")) return 6
    if (text.includes("d4") || text.includes("diploma 4") || text.includes("d-4")) return 7
    if (text.includes("s1") || text.includes("sarjana") || text.includes("strata 1")) return 8
    if (text.includes("profesi") || text.includes("ppg")) return 9
    if (text.includes("s2") || text.includes("magister") || text.includes("master") || text.includes("strata 2")) return 10
    if (text.includes("s3") || text.includes("doktor") || text.includes("doctor") || text.includes("strata 3")) return 11
    return 12
  }

  // Sort berdasarkan logical order lalu nama
  const sorted = [...educations].sort((a, b) => {
    const orderA = getLogicalOrder(a.name, a.level)
    const orderB = getLogicalOrder(b.name, b.level)
    if (orderA !== orderB) return orderA - orderB
    return a.name.localeCompare(b.name)
  })

  // Update urutan 1, 2, 3, ...
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i]
    const assignedOrder = i + 1
    await prisma.$executeRawUnsafe("UPDATE Education SET `order` = ? WHERE id = ?", assignedOrder, item.id)
    console.log(`- [#${assignedOrder}] ${item.name} (Level: ${item.level})`)
  }

  console.log("✔ Selesai memperbarui urutan seluruh data pendidikan!")
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
