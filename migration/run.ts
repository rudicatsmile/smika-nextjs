import { logger } from "./utils/logger"
import { idMap } from "./utils/id-map"
import { closeConnections } from "./utils/db"
import {
  extractMasterData,
  extractEmployees,
  extractLegacyUsers,
  extractChildren,
  extractSpouses,
  extractEducationHistory,
  extractTrainings,
  extractCertifications,
  extractWorkUnits,
  extractSocialOrganizations,
  extractHealthData,
  extractKesediaan,
  extractDocuments,
  extractDP3,
} from "./extract"
import {
  cleanSeedData,
  syncMasterData,
  loadEmployees,
  loadAdminUsers,
  loadRelationalData,
} from "./load"
import { copyAssets } from "./copy-assets"

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes("--dry-run") || !args.includes("--execute")
  const shouldCleanSeed = args.includes("--clean-seed")
  const shouldCopyAssets = args.includes("--copy-files")

  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                   SIMKA DATA MIGRATION ENGINE                      ║
║         Legacy (CodeIgniter 3)  ──►  Modern (Next.js 15+)          ║
╚════════════════════════════════════════════════════════════════════╝
Mode:            ${isDryRun ? "\x1b[33mDRY-RUN (Simulasi Validasi - Tanpa Tulis ke DB)\x1b[0m" : "\x1b[32mLIVE EXECUTION (Menulis ke Database Baru)\x1b[0m"}
Clean Dummy:     ${shouldCleanSeed ? "Ya (Bersihkan data dummy seed)" : "Tidak"}
Copy Files:      ${shouldCopyAssets ? "Ya (Salin file fisik)" : "Tidak"}
Target Database: simka9
Source Database: simka9_ci
`)

  const startTime = Date.now()

  try {
    // 1. Initialize migration mapping table
    await idMap.initTable()

    // 2. Clean seed data if requested and not in dry-run
    if (shouldCleanSeed && !isDryRun) {
      await cleanSeedData()
    }

    // 3. Extract all data from legacy DB
    logger.section("EXTRACTING DATA FROM LEGACY DATABASE (simka9_ci)")
    const [
      masterData,
      employees,
      legacyUsers,
      children,
      spouses,
      educationHistory,
      trainings,
      certifications,
      workUnits,
      socialOrganizations,
      healthData,
      kesediaan,
      documents,
      dp3,
    ] = await Promise.all([
      extractMasterData(),
      extractEmployees(),
      extractLegacyUsers(),
      extractChildren(),
      extractSpouses(),
      extractEducationHistory(),
      extractTrainings(),
      extractCertifications(),
      extractWorkUnits(),
      extractSocialOrganizations(),
      extractHealthData(),
      extractKesediaan(),
      extractDocuments(),
      extractDP3(),
    ])

    logger.info(`Extracted:
- Pegawai:              ${employees.length}
- Legacy Users:         ${legacyUsers.length}
- Unit Kerja:           ${masterData.unit.length}
- Jabatan:              ${masterData.jabatan.length}
- Jenjang Pendidikan:   ${masterData.jenjang.length}
- Agama:                ${masterData.agama.length}
- Anak:                 ${children.length}
- Pasangan:             ${spouses.length}
- Riwayat Pendidikan:   ${educationHistory.length}
- Pelatihan / Diklat:   ${trainings.length}
- Sertifikasi:          ${certifications.length}
- Kerja Lain:           ${workUnits.length}
- Organisasi:           ${socialOrganizations.length}
- Data Kesehatan:       ${healthData.length}
- Kesediaan:            ${kesediaan.length}
- Dokumen Penting:      ${documents.length}
- Penilaian DP3:        ${dp3.length}
`)

    // 4. Sync master data
    const cache = await syncMasterData(masterData, isDryRun)

    // 5. Load employees & users
    await loadEmployees(employees, cache, isDryRun)
    await loadAdminUsers(legacyUsers, isDryRun)

    // 6. Load relational data
    await loadRelationalData(
      {
        children,
        spouses,
        educationHistory,
        trainings,
        certifications,
        workUnits,
        socialOrganizations,
        healthData,
        kesediaan,
        documents,
        dp3,
      },
      cache,
      isDryRun
    )

    // 7. Copy assets
    if (shouldCopyAssets) {
      await copyAssets(isDryRun)
    }

    // 8. Output summary
    logger.printSummary()

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    logger.info(`Migration process completed in ${duration} seconds.`)

    if (isDryRun) {
      console.log(`
\x1b[33m[PERHATIAN] Ini adalah hasil DRY-RUN (simulasi).\x1b[0m
Untuk mengeksekusi migrasi sungguhan, jalankan perintah:
  \x1b[32mnpx tsx migration/run.ts --execute --clean-seed --copy-files\x1b[0m
`)
    }
  } catch (error: any) {
    logger.error("SYSTEM", "MIGRATION_FATAL", error.stack || error.message)
    console.error("FATAL ERROR DURING MIGRATION:", error)
  } finally {
    await idMap.close()
    await closeConnections()
  }
}

main()
