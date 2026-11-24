import { queryOldDb } from "../utils/db"

export async function extractMasterData() {
  const [
    agama,
    unit,
    jabatan,
    jenjang,
    dp3Status,
    propinsi,
    identitas,
    logo,
    occupationsFromAnak,
    occupationsFromPasangan,
    yearsFromDp3,
  ] = await Promise.all([
    queryOldDb("SELECT * FROM agama WHERE status = 'Aktif' OR deletedon IS NULL"),
    queryOldDb("SELECT * FROM unit WHERE status = 'Aktif' OR deletedon IS NULL ORDER BY urut ASC, unit_id ASC"),
    queryOldDb("SELECT * FROM jabatan WHERE status = 'aktif' ORDER BY urut ASC"),
    queryOldDb("SELECT * FROM jenjang_pendidikan WHERE status = 'Aktif' OR deletedon IS NULL ORDER BY urut ASC"),
    queryOldDb("SELECT * FROM dp3_status ORDER BY id ASC"),
    queryOldDb("SELECT * FROM propinsi"),
    queryOldDb("SELECT * FROM identitas LIMIT 1"),
    queryOldDb("SELECT * FROM logo LIMIT 1"),
    queryOldDb("SELECT DISTINCT pekerjaan FROM anak WHERE pekerjaan IS NOT NULL AND pekerjaan != ''"),
    queryOldDb("SELECT DISTINCT pekerjaan FROM pasangan WHERE pekerjaan IS NOT NULL AND pekerjaan != ''"),
    queryOldDb("SELECT DISTINCT tahun FROM dp3 WHERE tahun IS NOT NULL ORDER BY tahun ASC"),
  ])

  // Merge unique occupations
  const occSet = new Set<string>()
  for (const r of occupationsFromAnak) if (r.pekerjaan) occSet.add(r.pekerjaan.trim())
  for (const r of occupationsFromPasangan) if (r.pekerjaan) occSet.add(r.pekerjaan.trim())

  return {
    agama,
    unit,
    jabatan,
    jenjang,
    dp3Status,
    propinsi,
    identitas: identitas[0] || null,
    logo: logo[0] || null,
    occupations: Array.from(occSet),
    years: yearsFromDp3.map((r: any) => String(r.tahun)).filter(Boolean),
  }
}

export async function extractEmployees() {
  return queryOldDb("SELECT * FROM pegawai ORDER BY id_pegawai ASC")
}

export async function extractLegacyUsers() {
  return queryOldDb("SELECT * FROM users ORDER BY username ASC")
}

export async function extractChildren() {
  return queryOldDb("SELECT * FROM anak ORDER BY id_anak ASC")
}

export async function extractSpouses() {
  return queryOldDb("SELECT * FROM pasangan ORDER BY id_pasangan ASC")
}

export async function extractEducationHistory() {
  return queryOldDb("SELECT * FROM riwayat_pendidikan ORDER BY id_pendidikan ASC")
}

export async function extractTrainings() {
  return queryOldDb("SELECT * FROM pelatihan ORDER BY id_pelatihan ASC")
}

export async function extractCertifications() {
  return queryOldDb("SELECT * FROM sertifikasi ORDER BY id_sertifikasi ASC")
}

export async function extractWorkUnits() {
  return queryOldDb("SELECT * FROM kerjalain ORDER BY id_kerjalain ASC")
}

export async function extractSocialOrganizations() {
  return queryOldDb("SELECT * FROM organisasi ORDER BY id_organisasi ASC")
}

export async function extractHealthData() {
  return queryOldDb("SELECT * FROM kesehatan ORDER BY id_kesehatan ASC")
}

export async function extractKesediaan() {
  return queryOldDb("SELECT * FROM kesediaan ORDER BY id_kesediaan ASC")
}

export async function extractDocuments() {
  return queryOldDb("SELECT * FROM dokumen ORDER BY id_dokumen ASC")
}

export async function extractDP3() {
  return queryOldDb("SELECT * FROM dp3 ORDER BY id_dp3 ASC")
}
