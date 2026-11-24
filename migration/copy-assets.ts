import fs from "fs"
import path from "path"
import { config } from "./config"
import { logger } from "./utils/logger"

export async function copyAssets(isDryRun: boolean = false) {
  logger.section("5. COPYING PHYSICAL ASSETS & ATTACHMENTS")

  const assetMappings = [
    { src: path.join(config.paths.oldAssets, "foto_pegawai"), dest: path.join(config.paths.newUploads, "avatars"), label: "Foto Pegawai" },
    { src: path.join(config.paths.oldAssets, "dokumen_lain"), dest: path.join(config.paths.newUploads, "documents"), label: "Dokumen Penting" },
    { src: path.join(config.paths.oldAssets, "dokumen_pelatihan"), dest: path.join(config.paths.newUploads, "trainings"), label: "Sertifikat Pelatihan" },
    { src: path.join(config.paths.oldAssets, "dokumen_sertifikasi"), dest: path.join(config.paths.newUploads, "certifications"), label: "Sertifikasi Pendidik" },
    { src: path.join(config.paths.oldAssets, "dokumen_kesediaan"), dest: path.join(config.paths.newUploads, "kesediaan"), label: "Dokumen Kesediaan" },
    { src: path.join(config.paths.oldAssets, "dokumen_kesehatan"), dest: path.join(config.paths.newUploads, "kesehatan"), label: "Dokumen Kesehatan" },
  ]

  let totalFiles = 0
  let copiedFiles = 0

  for (const m of assetMappings) {
    if (!fs.existsSync(m.src)) {
      logger.info(`Source folder does not exist: ${m.src} (Skipping)`)
      continue
    }

    if (!fs.existsSync(m.dest) && !isDryRun) {
      fs.mkdirSync(m.dest, { recursive: true })
    }

    const files = fs.readdirSync(m.src).filter((f) => !f.startsWith(".") && fs.statSync(path.join(m.src, f)).isFile())
    totalFiles += files.length

    logger.info(`Found ${files.length} files in [${m.label}]`)

    for (const file of files) {
      const srcFile = path.join(m.src, file)
      const destFile = path.join(m.dest, file)

      if (!isDryRun) {
        try {
          fs.copyFileSync(srcFile, destFile)
          copiedFiles++
        } catch (err: any) {
          logger.error("asset", file, `Failed to copy: ${err.message}`)
        }
      } else {
        copiedFiles++
      }
    }
  }

  logger.info(`✅ Asset synchronization finished. Processed ${copiedFiles} of ${totalFiles} files.`)
}
