import { prisma } from "../lib/prisma"

interface ColumnInfo {
  Field: string
}

// Prioritas hierarki awal berdasarkan nama jabatan (semakin kecil semakin atas)
function getPositionHierarchyRank(name: string): number {
  const n = name.toLowerCase().trim()
  if (n.includes("kepala biro")) return 1
  if (n.includes("kepala bagian")) return 2
  if (n.includes("kepala divisi")) return 3
  if (n === "kepala sekolah" || (n.includes("kepala sekolah") && !n.includes("wakil"))) return 4
  if (n.includes("wakil kepala sekolah")) return 5
  if (n.includes("konsultan")) return 6
  if (n.includes("kasubag")) return 7
  if (n.includes("sekretaris")) return 8
  if (n.includes("bendahara")) return 9
  if (n === "guru" || (n.startsWith("guru") && !n.includes("bk"))) return 10
  if (n.includes("guru bk")) return 11
  if (n.includes("staff yayasan")) return 12
  if (n.includes("staff tata usaha") || n.includes("tata usaha")) return 13
  if (n.includes("operator")) return 14
  if (n.includes("pustakawan")) return 15
  if (n.includes("teknisi")) return 16
  if (n.includes("toolman")) return 17
  if (n.includes("pelatih")) return 18
  if (n.includes("koordinator keamanan")) return 19
  if (n === "keamanan") return 20
  if (n.includes("satpam")) return 21
  if (n.includes("penjaga")) return 22
  if (n.includes("office boy")) return 23
  return 99
}

async function main() {
  console.log("Memeriksa kolom 'order' pada tabel Position...")
  const cols = (await prisma.$queryRawUnsafe("SHOW COLUMNS FROM `Position`")) as ColumnInfo[]
  const hasOrder = cols.some((c) => c.Field === "order")

  if (!hasOrder) {
    console.log("Menambahkan kolom 'order' ke tabel Position...")
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `Position` ADD COLUMN `order` INT NOT NULL DEFAULT 0 AFTER `positionType`"
    )
    console.log("✔ Kolom 'order' berhasil ditambahkan ke tabel Position")
  } else {
    console.log("✔ Kolom 'order' sudah ada di tabel Position")
  }

  const positions = (await prisma.$queryRawUnsafe(
    "SELECT id, name, positionType, `order` FROM `Position`"
  )) as Array<{ id: string; name: string; positionType: string; order: number }>

  const sorted = [...positions].sort((a, b) => {
    const rankA = getPositionHierarchyRank(a.name)
    const rankB = getPositionHierarchyRank(b.name)
    if (rankA !== rankB) return rankA - rankB
    return a.name.localeCompare(b.name)
  })

  console.log(`Mengisi urutan awal untuk ${sorted.length} jabatan:`)
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i]
    const orderNum = i + 1
    await prisma.$executeRawUnsafe("UPDATE `Position` SET `order` = ? WHERE id = ?", orderNum, p.id)
    console.log(`- [#${orderNum}] ${p.name} (${p.positionType})`)
  }

  console.log("✔ Selesai memperbarui urutan awal tabel Position!")
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
