import { prisma } from "../lib/prisma"

interface ColumnInfo {
  Field: string
}

async function main() {
  console.log("Memeriksa kolom 'order' pada tabel Department...")
  const cols = (await prisma.$queryRawUnsafe("SHOW COLUMNS FROM `Department`")) as ColumnInfo[]
  const hasOrder = cols.some((c) => c.Field === "order")

  if (!hasOrder) {
    console.log("Menambahkan kolom 'order' ke tabel Department...")
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `Department` ADD COLUMN `order` INT NOT NULL DEFAULT 0 AFTER `canTeach`"
    )
    console.log("✔ Kolom 'order' berhasil ditambahkan ke tabel Department")
  } else {
    console.log("✔ Kolom 'order' sudah ada di tabel Department")
  }

  const depts = (await prisma.$queryRawUnsafe(
    "SELECT id, code, name, `order` FROM `Department`"
  )) as Array<{ id: string; code: string; name: string; order: number }>

  // Prioritas pengurutan logis unit:
  // 1. Unit utama 2024.01.01 - 2024.01.12 (Yayasan -> TK -> SD -> SMP -> SMK DP1 -> SMK DP2 -> Tendik/Support)
  // 2. Sub-unit pusat 2024.01.01.xx
  // 3. Data legacy/seed lainnya
  function getPriorityTuple(code: string, name: string): [number, string, string] {
    if (/^\d{4}\.\d{2}\.\d{2}$/.test(code)) {
      return [1, code, name]
    }
    if (/^\d{4}\.\d{2}\.\d{2}\./.test(code)) {
      return [2, code, name]
    }
    return [3, code, name]
  }

  const sorted = [...depts].sort((a, b) => {
    const [gA, cA, nA] = getPriorityTuple(a.code, a.name)
    const [gB, cB, nB] = getPriorityTuple(b.code, b.name)
    if (gA !== gB) return gA - gB
    const cmpCode = cA.localeCompare(cB)
    if (cmpCode !== 0) return cmpCode
    return nA.localeCompare(nB)
  })

  console.log(`Mengisi urutan awal untuk ${sorted.length} departemen:`)
  for (let i = 0; i < sorted.length; i++) {
    const d = sorted[i]
    const orderNum = i + 1
    await prisma.$executeRawUnsafe("UPDATE `Department` SET `order` = ? WHERE id = ?", orderNum, d.id)
    console.log(`- [#${orderNum}] ${d.code} — ${d.name}`)
  }

  console.log("✔ Selesai memperbarui urutan awal tabel Department!")
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
