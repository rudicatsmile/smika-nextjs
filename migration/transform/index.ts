import { parseIndoDate, cleanString, cleanNumber } from "../utils/date-parser"
import { idMap } from "../utils/id-map"
import { Gender, MaritalStatus, EmploymentStatus, DepartmentType, PositionType } from "../../app/generated/prisma/client"

export interface LookupCache {
  religionsByCode: Record<string, string>      // '01' -> religionId
  bloodTypesByName: Record<string, string>     // 'A' -> bloodTypeId
  employmentStatusesByName: Record<string, string> // 'PTY' -> statusId
  positionsByUrut: Record<string, string>      // '9' -> positionId
  positionsBySlug: Record<string, string>      // 'kasubag' -> positionId
  departmentsByCode: Record<string, string>    // '2024.01.03' -> deptId
  educationsByCode: Record<string, string>     // '01' -> educationId
  educationNamesByCode: Record<string, string> // '04' -> 'S1 / Diploma IV'
  provincesByCode: Record<string, string>      // '31' -> 'DKI Jakarta'
  occupationsByName: Record<string, string>    // 'Pelajar' -> occupationId
  yearsByName: Record<string, string>          // '2024' -> yearId
  dp3StatusById: Record<string, string>        // '1' -> statusDP3Id
}

export function transformEmployee(row: any, cache: LookupCache) {
  const gender = row.jns_kelamin === "perempuan" ? Gender.PEREMPUAN : row.jns_kelamin === "laki-laki" ? Gender.LAKI_LAKI : null

  let maritalStatus: MaritalStatus | null = null
  if (row.status_nikah === "Kawin") maritalStatus = MaritalStatus.MENIKAH
  else if (row.status_nikah === "Belum Kawin") maritalStatus = MaritalStatus.BELUM_MENIKAH
  else if (row.status_nikah === "Duda") maritalStatus = MaritalStatus.CERAI_HIDUP
  else if (row.status_nikah === "Janda") maritalStatus = MaritalStatus.CERAI_MATI

  const employmentStatus = row.pstatus === "Non Aktif" ? EmploymentStatus.NON_AKTIF : EmploymentStatus.AKTIF
  const isBlocked = row.blokir === "Ya"

  // Resolving IDs
  const religionId = row.agama ? cache.religionsByCode[String(row.agama).trim()] : null
  const bloodTypeId = row.gol_darah ? cache.bloodTypesByName[String(row.gol_darah).trim().toUpperCase()] : null
  const departmentId = row.unit_id ? idMap.get("unit", row.unit_id) : null

  let positionId: string | null = null
  if (row.unit_jabatan_data && cache.positionsByUrut[String(row.unit_jabatan_data).trim()]) {
    positionId = cache.positionsByUrut[String(row.unit_jabatan_data).trim()]
  } else if (row.unit_jabatan && cache.positionsBySlug[String(row.unit_jabatan).trim().toLowerCase()]) {
    positionId = cache.positionsBySlug[String(row.unit_jabatan).trim().toLowerCase()]
  }

  const statusKep = cleanString(row.status_kepegawaian)
  const employmentStatusId = statusKep ? cache.employmentStatusesByName[statusKep] : null

  // Provinces
  const province = row.provinsi ? (cache.provincesByCode[String(row.provinsi).trim()] || String(row.provinsi)) : null
  const secondaryProvince = row.provinsi2 ? (cache.provincesByCode[String(row.provinsi2).trim()] || String(row.provinsi2)) : null

  return {
    employeeIdNumber: String(row.nip).trim(),
    nationalIdNumber: cleanString(row.nik),
    bpjsNumber: cleanString(row.bpjs),
    taxIdNumber: cleanString(row.npwp),
    educatorIdNumber: cleanString(row.nuptk),
    fullName: String(row.nama_lengkap).trim(),
    profilePhoto: row.foto ? `/uploads/avatars/${row.foto}` : null,
    placeOfBirth: cleanString(row.tmp_lahir),
    dateOfBirth: parseIndoDate(row.tgl_lahir),
    gender,
    maritalStatus,
    employmentStatus,
    isBlocked,
    address: cleanString(row.alamat),
    province,
    postalCode: cleanString(row.kodepos),
    secondaryAddress: cleanString(row.alamat2),
    secondaryProvince,
    secondaryPostalCode: cleanString(row.kodepos2),
    email: cleanString(row.email),
    phoneNumber: cleanString(row.no_tlp),
    hobbies: cleanString(row.hobi),
    height: cleanNumber(row.tinggi_badan),
    weight: cleanNumber(row.berat_badan),
    positionUnit: cleanString(row.unit_jabatan),
    positionData: cleanString(row.unit_jabatan_data),
    functionUnit: cleanString(row.unit_fungsi),
    taskUnit: cleanString(row.unit_tugas),
    teachingUnit: cleanString(row.unit_pelajaran),
    joinDate: parseIndoDate(row.mulai_bekerja),
    highestEducation: row.pendidikan_terakhir ? (cache.educationNamesByCode[String(row.pendidikan_terakhir).trim()] || String(row.pendidikan_terakhir)) : null,
    major: cleanString(row.program_studi),
    institutionName: cleanString(row.nama_kampus),
    graduationYear: cleanNumber(row.tahun_lulus),
    religionId: religionId || null,
    bloodTypeId: bloodTypeId || null,
    departmentId: departmentId || null,
    positionId: positionId || null,
    employmentStatusId: employmentStatusId || null,
  }
}

export function transformChild(row: any, cache: LookupCache) {
  const employeeId = idMap.get("pegawai", row.id_pegawai)!
  const gender = row.jns_kelamin === "L" ? Gender.LAKI_LAKI : row.jns_kelamin === "P" ? Gender.PEREMPUAN : null
  const eduCode = cleanString(row.pendidikan)
  const educationId = eduCode ? (cache.educationsByCode[eduCode] || null) : null
  const occName = cleanString(row.pekerjaan)
  const occupationId = occName ? (cache.occupationsByName[occName] || null) : null

  return {
    employeeId,
    name: String(row.nama_anak).trim(),
    placeOfBirth: cleanString(row.tmp_lahir_anak),
    dateOfBirth: parseIndoDate(row.tgl_lahir_anak),
    gender,
    relationship: cleanString(row.hubungan) || "Anak Kandung",
    educationId,
    occupationId,
  }
}

export function transformSpouse(row: any, cache: LookupCache) {
  const employeeId = idMap.get("pegawai", row.id_pegawai)!
  const relationship = cleanString(row.hubungan) || "Pasangan"
  const gender = relationship.toLowerCase() === "suami" ? Gender.LAKI_LAKI : Gender.PEREMPUAN
  const occName = cleanString(row.pekerjaan)
  const occupationId = occName ? (cache.occupationsByName[occName] || null) : null

  return {
    employeeId,
    name: String(row.nama_pasangan).trim(),
    placeOfBirth: cleanString(row.tmp_lahir_pasangan),
    dateOfBirth: parseIndoDate(row.tgl_lahir_pasangan),
    gender,
    relationship,
    educationId: null,
    occupationId,
  }
}

export function transformEducationHistory(row: any, defaultEducationId: string) {
  const employeeId = idMap.get("pegawai", row.id_pegawai)!
  const tgl = parseIndoDate(row.tgl_ijazah)

  return {
    employeeId,
    educationId: defaultEducationId,
    institutionName: cleanString(row.nama_sekolah),
    major: cleanString(row.jenjang_jurusan),
    graduationYear: tgl ? tgl.getFullYear() : null,
    endDate: tgl,
    isGraduated: true,
  }
}

export function transformTraining(row: any) {
  const employeeId = idMap.get("pegawai", row.id_pegawai)!
  return {
    employeeId,
    name: String(row.nama_diklat).trim(),
    type: String(row.jns_pelatihan || "Pelatihan").trim(),
    organizerLocation: cleanString(row.tempat_penyelenggara),
    batch: cleanString(row.angkatan),
    date: parseIndoDate(row.tgl_diklat),
    certificateNumber: cleanString(row.no_sttpp),
    certificateDate: parseIndoDate(row.tgl_sttpp),
    certificateFile: row.sertifikat ? `/uploads/trainings/${row.sertifikat}` : null,
  }
}

export function transformCertification(row: any) {
  const employeeId = idMap.get("pegawai", row.id_pegawai)!
  return {
    employeeId,
    isCertifiedTeacher: row.is_sertifikasi === "Ya",
    certificationBaseSchool: cleanString(row.sekolah_sertifikasi),
    educationCertificateNumber: cleanString(row.nomor_sertifikasi),
    certificationYear: cleanNumber(row.tahun_sertifikasi),
    inpassingBaseSchool: cleanString(row.sekolah_inpassing),
    inpassingSkNumber: cleanString(row.nomor_inpassing),
    inpassingSkYear: cleanNumber(row.tahun_inpassing),
    file: row.sertifikat ? `/uploads/certifications/${row.sertifikat}` : null,
  }
}

export function transformWorkUnit(row: any) {
  const employeeId = idMap.get("pegawai", row.id_pegawai)!
  return {
    employeeId,
    worksElsewhere: row.is_kerjalain === "Ya",
    workplaceName: cleanString(row.tempat_kerja),
    status: cleanString(row.status),
    position: cleanString(row.jabatan),
    positionFunction: cleanString(row.fungsi_jabatan),
    workplaceAddress: cleanString(row.alamat_kerja),
  }
}

export function transformSocialOrganization(row: any) {
  const employeeId = idMap.get("pegawai", row.id_pegawai)!
  return {
    employeeId,
    organizationName: cleanString(row.nama_organisasi),
    organizationAddress: cleanString(row.tempat_organisasi),
    position: cleanString(row.jabatan_organisasi),
    joinDate: parseIndoDate(row.tgl_bergabung),
  }
}

export function transformHealthData(row: any) {
  const employeeId = idMap.get("pegawai", row.id_pegawai)!
  return {
    employeeId,
    healthcareProviderName: cleanString(row.nama_lembaga),
    level1HealthFacility: cleanString(row.tempat_lembaga),
    bpjsNumber: null,
  }
}

export function transformKesediaan(row: any) {
  const employeeId = idMap.get("pegawai", row.id_pegawai)!
  return {
    employeeId,
    tanggal: parseIndoDate(row.tanggal) || new Date(),
    isBersedia: row.is_kesediaan === "Ya",
    alasanKesanggupan: cleanMemo(row.kesanggupan),
    kesediaanHariKerja: cleanMemo(row.kesediaan_hari_mengajar),
    photo: row.photo ? `/uploads/kesediaan/${row.photo}` : null,
  }
}

export function transformImportantDocuments(row: any): Array<{ employeeId: string; documentType: string; fileUrl: string }> {
  const employeeId = idMap.get("pegawai", row.id_pegawai)
  if (!employeeId) return []

  const docMapping: Array<{ field: string; type: string }> = [
    { field: "dokumen1", type: "KTP" },
    { field: "dokumen2", type: "KARTU_KELUARGA" },
    { field: "dokumen3", type: "IJAZAH" },
    { field: "dokumen4", type: "NPWP" },
    { field: "dokumen5", type: "BPJS" },
    { field: "dokumen6", type: "SERTIFIKASI_PENDIDIKAN" },
    { field: "dokumen7", type: "SK_PENGANGKATAN" },
    { field: "dokumen8", type: "ID_CARD" },
    { field: "dokumen9", type: "DOKUMEN_TAMBAHAN" },
    { field: "dokumen10", type: "LAIN_LAIN" },
  ]

  const docs = []
  for (const m of docMapping) {
    const filename = cleanString(row[m.field])
    if (filename) {
      docs.push({
        employeeId,
        documentType: m.type,
        fileUrl: `/uploads/documents/${filename}`,
      })
    }
  }
  return docs
}

function cleanMemo(val: unknown): string | null {
  const s = cleanString(val)
  return s ? s.slice(0, 190) : null
}

export function transformDP3(row: any, cache: LookupCache) {
  const employeeId = idMap.get("pegawai", row.id_pegawai)!
  const tahunStr = String(row.tahun || "").trim()
  const tahunId = cache.yearsByName[tahunStr] || null
  const defaultStatusId = Object.values(cache.dp3StatusById)[0] || ""
  const statusDP3Id = cache.dp3StatusById[String(row.status)] || defaultStatusId

  return {
    employeeId,
    tahunId: tahunId!,
    statusDP3Id: statusDP3Id,
    kualitasKerjaNilai: Number(row.n1) || 0,
    kualitasKerjaAlasan: cleanMemo(row.memo_kesetiaan),
    kehadiranDanKedisiplinanNilai: Number(row.n2) || 0,
    kehadiranDanKedisiplinanAlasan: cleanMemo(row.memo_prestasi),
    kerjasamaTimNilai: Number(row.n3) || 0,
    kerjasamaTimAlasan: cleanMemo(row.memo_tanggung_jawab),
    komitmenVisiMisiNilai: Number(row.n4) || 0,
    komitmenVisiMisiAlasan: cleanMemo(row.memo_ketaatan),
    pengembanganDiriNilai: Number(row.n5) || 0,
    pengembanganDiriAlasan: cleanMemo(row.memo_kejujuran),
    penggunaanTeknologiNilai: Number(row.n6) || 0,
    penggunaanTeknologiAlasan: cleanMemo(row.memo_kerjasama),
    ketaatanKepatuhanNilai: Number(row.n7) || 0,
    ketaatanKepatuhanAlasan: cleanMemo(row.memo_prakarsa),
    komunikasiEfektifNilai: Number(row.n8) || 0,
    komunikasiEfektifAlasan: cleanMemo(row.memo_kepemimpinan),
    inisiatifProblemSolvingNilai: Number(row.n9) || 0,
    inisiatifProblemSolvingAlasan: cleanMemo(row.memo_inisiatif),
    jumlah: Number(row.jml) || 0,
    rataRata: Math.round(Number(row.rata2) || 0),
    bobot: Math.round(Number(row.bobot) || 0),
  }
}
