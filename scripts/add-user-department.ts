import { prisma } from "../lib/prisma"

interface ColumnInfo {
  Field: string
}

const ADMIN_UNIT_DEPT_CODES: Record<string, string> = {
  user_yayasan: "2024.01.01",
  user_tk: "2024.01.02",
  user_sd: "2024.01.03",
  user_smp: "2024.01.04",
  user_smkdp1: "2024.01.05",
  user_smkdp2: "2024.01.06",
}

async function main() {
  console.log("Memeriksa kolom departmentId pada tabel User...")
  const cols = (await prisma.$queryRawUnsafe("SHOW COLUMNS FROM `User`")) as ColumnInfo[]
  const hasDeptId = cols.some((c) => c.Field === "departmentId")

  if (!hasDeptId) {
    console.log("Menambahkan kolom departmentId ke tabel User...")
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `User` ADD COLUMN `departmentId` VARCHAR(191) NULL AFTER `employeeId`, ADD INDEX `User_departmentId_idx` (`departmentId`)"
    )
    try {
      await prisma.$executeRawUnsafe(
        "ALTER TABLE `User` ADD CONSTRAINT `User_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE"
      )
    } catch (fkErr) {
      console.warn("FK constraint skipped/already exists:", fkErr)
    }
    console.log("✔ Kolom departmentId berhasil ditambahkan ke tabel User")
  } else {
    console.log("✔ Kolom departmentId sudah ada di tabel User")
  }

  for (const [nip, deptCode] of Object.entries(ADMIN_UNIT_DEPT_CODES)) {
    const depts = (await prisma.$queryRawUnsafe(
      "SELECT id, code, name FROM `Department` WHERE code = ? LIMIT 1",
      deptCode
    )) as Array<{ id: string; code: string; name: string }>

    if (depts.length === 0) {
      console.warn(`⚠ Departemen dengan kode ${deptCode} tidak ditemukan untuk ${nip}`)
      continue
    }

    const dept = depts[0]
    await prisma.$executeRawUnsafe(
      "UPDATE `User` SET `departmentId` = ? WHERE `nip` = ?",
      dept.id,
      nip
    )
    console.log(`✔ ${nip} -> ${dept.name} (${dept.code}) [${dept.id}]`)
  }
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
