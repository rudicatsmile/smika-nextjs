import bcrypt from "bcryptjs"
import { newPrisma } from "../utils/db"
import { idMap, generateCuid } from "../utils/id-map"
import { logger } from "../utils/logger"
import { config } from "../config"
import { LookupCache, transformEmployee, transformChild, transformSpouse, transformEducationHistory, transformTraining, transformCertification, transformWorkUnit, transformSocialOrganization, transformHealthData, transformKesediaan, transformImportantDocuments, transformDP3 } from "../transform"
import { validateEmployeeRow, validateChildRow, validateSpouseRow, validateRelationalRow } from "../validators"
import { Role, DepartmentType, PositionType } from "../../app/generated/prisma/client"

export async function cleanSeedData() {
  logger.info("Cleaning up existing dummy seed data in target database...")
  // Clear relational tables first due to FK constraints
  await newPrisma.activityLog.deleteMany({})
  await newPrisma.passwordResetToken.deleteMany({})
  await newPrisma.importantDocument.deleteMany({})
  await newPrisma.employmentDocument.deleteMany({})
  await newPrisma.employeeDocument.deleteMany({})
  await newPrisma.employeeHistory.deleteMany({})
  await newPrisma.educationHistory.deleteMany({})
  await newPrisma.child.deleteMany({})
  await newPrisma.spouse.deleteMany({})
  await newPrisma.training.deleteMany({})
  await newPrisma.certification.deleteMany({})
  await newPrisma.workUnit.deleteMany({})
  await newPrisma.healthData.deleteMany({})
  await newPrisma.socialOrganization.deleteMany({})
  await newPrisma.kesediaan.deleteMany({})
  await newPrisma.dP3.deleteMany({})

  // Delete User then Employee
  await newPrisma.user.deleteMany({})
  await newPrisma.employee.deleteMany({})

  logger.info("✅ Target employee & user tables cleaned successfully.")
}

export async function syncMasterData(extracted: any, isDryRun: boolean): Promise<LookupCache> {
  logger.section("1. SYNCING MASTER DATA")

  const cache: LookupCache = {
    religionsByCode: {},
    bloodTypesByName: {},
    employmentStatusesByName: {},
    positionsByUrut: {},
    positionsBySlug: {},
    departmentsByCode: {},
    educationsByCode: {},
    educationNamesByCode: {},
    provincesByCode: {},
    occupationsByName: {},
    yearsByName: {},
    dp3StatusById: {},
  }

  // 1. Provinces dictionary
  for (const p of extracted.propinsi) {
    if (p.kode && p.deskripsi) {
      cache.provincesByCode[String(p.kode).trim()] = String(p.deskripsi).trim()
    }
  }

  // 2. Religions
  for (const a of extracted.agama) {
    const name = String(a.nama_agama).trim()
    const code = String(a.kode).trim()
    if (!isDryRun) {
      const rel = await newPrisma.religion.upsert({
        where: { name },
        update: {},
        create: { name, isActive: a.status === "Aktif" },
      })
      cache.religionsByCode[code] = rel.id
      await idMap.set("agama", a.agama_id, rel.id)
    } else {
      cache.religionsByCode[code] = `dry_religion_${code}`
    }
    logger.success("religion", a.agama_id, name)
  }

  // 3. Blood Types
  for (const b of ["A", "B", "AB", "O"]) {
    if (!isDryRun) {
      const blood = await newPrisma.bloodType.upsert({
        where: { name: b },
        update: {},
        create: { name: b, isActive: true },
      })
      cache.bloodTypesByName[b] = blood.id
    } else {
      cache.bloodTypesByName[b] = `dry_blood_${b}`
    }
  }

  // 4. Educations
  for (const j of extracted.jenjang) {
    const name = String(j.nama_jenjang_pendidikan).trim()
    const code = String(j.kode).trim()
    cache.educationNamesByCode[code] = name
    if (!isDryRun) {
      let level = "Sarjana"
      if (name.includes("SD")) level = "SD"
      else if (name.includes("SLTP") || name.includes("SMP")) level = "SMP"
      else if (name.includes("SLTA") || name.includes("SMA") || name.includes("SMK")) level = "SMA"
      else if (name.includes("Diploma") || name.includes("D3") || name.includes("D4")) level = "Diploma"

      const edu = await newPrisma.education.upsert({
        where: { name },
        update: {},
        create: { name, level, isActive: j.status === "Aktif" },
      })
      cache.educationsByCode[code] = edu.id
      await idMap.set("education", j.jenjang_pendidikan_id, edu.id)
    } else {
      cache.educationsByCode[code] = `dry_edu_${code}`
    }
    logger.success("education", j.jenjang_pendidikan_id, name)
  }

  // 5. Employment Status Master
  const empStatuses = ["PTY", "GTY", "GTTY", "PTTY", "PKK", "PTYY", "Honorer", "PNS", "PPPK", "Kontrak", "Magang"]
  for (const s of empStatuses) {
    if (!isDryRun) {
      const rec = await newPrisma.employmentStatusMaster.upsert({
        where: { name: s },
        update: {},
        create: { name: s, isActive: true },
      })
      cache.employmentStatusesByName[s] = rec.id
    } else {
      cache.employmentStatusesByName[s] = `dry_status_${s}`
    }
  }

  // 6. Occupations
  for (let i = 0; i < extracted.occupations.length; i++) {
    const occ = extracted.occupations[i]
    if (!isDryRun) {
      const rec = await newPrisma.occupation.upsert({
        where: { name: occ },
        update: {},
        create: { name: occ, order: i + 1, isActive: true },
      })
      cache.occupationsByName[occ] = rec.id
    } else {
      cache.occupationsByName[occ] = `dry_occ_${i}`
    }
    logger.success("occupation", i + 1, occ)
  }

  // 7. Years
  for (let i = 0; i < extracted.years.length; i++) {
    const yr = extracted.years[i]
    if (!isDryRun) {
      const rec = await newPrisma.year.upsert({
        where: { name: yr },
        update: {},
        create: { name: yr, order: Number(yr) || 2024, isActive: true },
      })
      cache.yearsByName[yr] = rec.id
    } else {
      cache.yearsByName[yr] = `dry_year_${yr}`
    }
    logger.success("year", yr, yr)
  }

  // 8. Status DP3
  for (const s of extracted.dp3Status) {
    const name = String(s.deskripsi).trim()
    if (!isDryRun) {
      const rec = await newPrisma.statusDP3.upsert({
        where: { name },
        update: {},
        create: { name, order: Number(s.kode) || 0, isActive: true },
      })
      cache.dp3StatusById[String(s.id)] = rec.id
    } else {
      cache.dp3StatusById[String(s.id)] = `dry_dp3status_${s.id}`
    }
    logger.success("statusdp3", s.id, name)
  }

  // 9. Departments (Units)
  for (const u of extracted.unit) {
    const name = String(u.nama_unit).trim()
    const code = u.kode ? String(u.kode).trim() : `UNIT_${u.unit_id}`
    let deptType = DepartmentType.SEKOLAH
    if (name.includes("Yayasan") || name.includes("Bagian") || name.includes("Biro") || name.includes("Divisi")) {
      deptType = DepartmentType.YAYASAN
    } else if (name.includes("Pengamanan") || name.includes("Satpam")) {
      deptType = DepartmentType.SEKURITI
    } else if (name.includes("Maintenance") || name.includes("Kebersihan")) {
      deptType = DepartmentType.MAINTENANCE
    }

    const canTeach = deptType === DepartmentType.SEKOLAH

    if (!isDryRun) {
      const dept = await newPrisma.department.upsert({
        where: { code },
        update: { name, departmentType: deptType, canTeach },
        create: {
          code,
          name,
          description: name,
          departmentType: deptType,
          canTeach,
          isActive: u.status === "Aktif",
        },
      })
      cache.departmentsByCode[code] = dept.id
      await idMap.set("unit", u.unit_id, dept.id)
    } else {
      cache.departmentsByCode[code] = `dry_dept_${code}`
    }
    logger.success("department", u.unit_id, `${code} - ${name}`)
  }

  // 10. Positions (Jabatan)
  for (const j of extracted.jabatan) {
    const name = String(j.nama_jabatan).trim()
    let posType = PositionType.SEKOLAH
    if (name.includes("Yayasan") || name.includes("Bagian") || name.includes("Biro") || name.includes("Divisi") || name.includes("Pimpinan")) {
      posType = PositionType.YAYASAN
    }

    if (!isDryRun) {
      const pos = await newPrisma.position.upsert({
        where: { name },
        update: { positionType: posType },
        create: { name, positionType: posType, isActive: j.status === "aktif" },
      })
      if (j.urut !== null && j.urut !== undefined) cache.positionsByUrut[String(j.urut)] = pos.id
      if (j.nama_jabatan_slug) cache.positionsBySlug[String(j.nama_jabatan_slug).trim().toLowerCase()] = pos.id
      await idMap.set("jabatan", j.id_jabatan, pos.id)
    } else {
      if (j.urut !== null && j.urut !== undefined) cache.positionsByUrut[String(j.urut)] = `dry_pos_${j.urut}`
      if (j.nama_jabatan_slug) cache.positionsBySlug[String(j.nama_jabatan_slug).trim().toLowerCase()] = `dry_pos_${j.nama_jabatan_slug}`
    }
    logger.success("position", j.id_jabatan, name)
  }

  // 11. App Configuration
  if (extracted.identitas && !isDryRun) {
    const ident = extracted.identitas
    await newPrisma.appConfiguration.create({
      data: {
        appName: ident.nama_website || "SIMKA",
        appOwner: ident.instansi || "Yayasan Al Wathoniyah 9",
        address: ident.alamat,
        phone: ident.no_telp,
        email: ident.email,
        website: ident.url,
        logoUrl: extracted.logo ? `/asset/admin/dist/img/${extracted.logo.gambar}` : null,
      },
    })
    logger.success("appconfiguration", 1, "App configuration migrated")
  }

  logger.info("✅ Master data synchronization complete.")
  return cache
}

export async function loadEmployees(employees: any[], cache: LookupCache, isDryRun: boolean) {
  logger.section("2. MIGRATING EMPLOYEES")
  const defaultPasswordHash = await bcrypt.hash(config.defaults.employeePassword, 10)
  const seenNip = new Set<string>()
  const seenNik = new Set<string>()

  for (const emp of employees) {
    const val = validateEmployeeRow(emp)
    if (!val.valid) {
      logger.skip("employee", emp.id_pegawai, val.error!)
      continue
    }

    let nip = String(emp.nip).trim()
    if (seenNip.has(nip)) {
      const fixedNip = `${nip}-DUP${emp.id_pegawai}`
      logger.skip("employee", emp.id_pegawai, `Duplicate NIP detected: ${nip}. Auto-resolved as ${fixedNip} for data preservation`)
      nip = fixedNip
    }
    seenNip.add(nip)

    try {
      const data = transformEmployee(emp, cache)
      data.employeeIdNumber = nip

      if (data.nationalIdNumber) {
        if (seenNik.has(data.nationalIdNumber)) {
          logger.skip("employee_nik", emp.id_pegawai, `Duplicate NIK ${data.nationalIdNumber} detected. Cleared to NULL to satisfy unique constraint`)
          data.nationalIdNumber = null
        } else {
          seenNik.add(data.nationalIdNumber)
        }
      }

      let targetId = idMap.get("pegawai", emp.id_pegawai) || generateCuid()

      if (!isDryRun) {
        await idMap.set("pegawai", emp.id_pegawai, targetId)
        await newPrisma.employee.upsert({
          where: { employeeIdNumber: nip },
          update: data,
          create: { id: targetId, ...data },
        })

        // Also create User login account for active employee
        await newPrisma.user.upsert({
          where: { nip },
          update: {
            name: data.fullName,
            employeeId: targetId,
            isActive: !data.isBlocked,
          },
          create: {
            name: data.fullName,
            nip,
            email: data.email,
            passwordHash: defaultPasswordHash,
            role: Role.PEGAWAI,
            isActive: !data.isBlocked,
            employeeId: targetId,
          },
        })
      } else {
        await idMap.set("pegawai", emp.id_pegawai, targetId)
      }

      logger.success("employee", emp.id_pegawai, `${nip} - ${data.fullName}`)
    } catch (err: any) {
      logger.error("employee", emp.id_pegawai, err.message)
    }
  }
}

export async function loadAdminUsers(users: any[], isDryRun: boolean) {
  logger.section("3. MIGRATING ADMINISTRATIVE USERS")
  const adminPasswordHash = await bcrypt.hash(config.defaults.adminPassword, 10)

  for (const u of users) {
    const username = String(u.username).trim()
    let role = Role.HR
    if (u.level === "admin") role = Role.SUPER_ADMIN
    else if (u.user_type === "pimpinan") role = Role.PIMPINAN

    const isEmail = username.includes("@")
    const emailVal = isEmail ? username : (u.email ? String(u.email).trim() : null)
    const nipVal = isEmail ? null : username

    if (!isDryRun) {
      try {
        await newPrisma.user.upsert({
          where: isEmail ? { email: emailVal! } : { nip: nipVal! },
          update: {
            name: String(u.nama_lengkap || username).trim(),
            role,
            isActive: u.blokir !== "Y",
          },
          create: {
            name: String(u.nama_lengkap || username).trim(),
            nip: nipVal,
            email: emailVal,
            passwordHash: adminPasswordHash,
            role,
            isActive: u.blokir !== "Y",
          },
        })
        logger.success("user", username, `${username} [${role}]`)
      } catch (err: any) {
        logger.error("user", username, err.message)
      }
    } else {
      logger.success("user", username, `[DRY-RUN] ${username} [${role}]`)
    }
  }
}

export async function loadRelationalData(extracted: any, cache: LookupCache, isDryRun: boolean) {
  logger.section("4. MIGRATING EMPLOYEE RELATIONAL & TRANSACTIONAL DATA")

  // 1. Children
  for (const c of extracted.children) {
    const val = validateChildRow(c)
    if (!val.valid) { logger.skip("child", c.id_anak, val.error!); continue }
    try {
      const data = transformChild(c, cache)
      if (!isDryRun) await newPrisma.child.create({ data })
      logger.success("child", c.id_anak, data.name)
    } catch (err: any) { logger.error("child", c.id_anak, err.message) }
  }

  // 2. Spouses
  for (const s of extracted.spouses) {
    const val = validateSpouseRow(s)
    if (!val.valid) { logger.skip("spouse", s.id_pasangan, val.error!); continue }
    try {
      const data = transformSpouse(s, cache)
      if (!isDryRun) await newPrisma.spouse.create({ data })
      logger.success("spouse", s.id_pasangan, data.name)
    } catch (err: any) { logger.error("spouse", s.id_pasangan, err.message) }
  }

  // 3. Education History
  const defaultEduId = Object.values(cache.educationsByCode)[0] || ""
  for (const ed of extracted.educationHistory) {
    const val = validateRelationalRow(ed, "educationhistory", "id_pendidikan")
    if (!val.valid) { logger.skip("educationhistory", ed.id_pendidikan, val.error!); continue }
    try {
      const data = transformEducationHistory(ed, defaultEduId)
      if (!isDryRun) await newPrisma.educationHistory.create({ data })
      logger.success("educationhistory", ed.id_pendidikan, data.institutionName || "-")
    } catch (err: any) { logger.error("educationhistory", ed.id_pendidikan, err.message) }
  }

  // 4. Trainings
  for (const t of extracted.trainings) {
    const val = validateRelationalRow(t, "training", "id_pelatihan")
    if (!val.valid) { logger.skip("training", t.id_pelatihan, val.error!); continue }
    try {
      const data = transformTraining(t)
      if (!isDryRun) await newPrisma.training.create({ data })
      logger.success("training", t.id_pelatihan, data.name)
    } catch (err: any) { logger.error("training", t.id_pelatihan, err.message) }
  }

  // 5. Certifications
  for (const cert of extracted.certifications) {
    const val = validateRelationalRow(cert, "certification", "id_sertifikasi")
    if (!val.valid) { logger.skip("certification", cert.id_sertifikasi, val.error!); continue }
    try {
      const data = transformCertification(cert)
      if (!isDryRun) await newPrisma.certification.create({ data })
      logger.success("certification", cert.id_sertifikasi, String(data.certificationYear || "-"))
    } catch (err: any) { logger.error("certification", cert.id_sertifikasi, err.message) }
  }

  // 6. Work Units (Kerja Lain)
  for (const w of extracted.workUnits) {
    const val = validateRelationalRow(w, "workunit", "id_kerjalain")
    if (!val.valid) { logger.skip("workunit", w.id_kerjalain, val.error!); continue }
    try {
      const data = transformWorkUnit(w)
      if (!isDryRun) await newPrisma.workUnit.create({ data })
      logger.success("workunit", w.id_kerjalain, data.workplaceName || "-")
    } catch (err: any) { logger.error("workunit", w.id_kerjalain, err.message) }
  }

  // 7. Social Organizations
  for (const o of extracted.socialOrganizations) {
    const val = validateRelationalRow(o, "socialorganization", "id_organisasi")
    if (!val.valid) { logger.skip("socialorganization", o.id_organisasi, val.error!); continue }
    try {
      const data = transformSocialOrganization(o)
      if (!isDryRun) await newPrisma.socialOrganization.create({ data })
      logger.success("socialorganization", o.id_organisasi, data.organizationName || "-")
    } catch (err: any) { logger.error("socialorganization", o.id_organisasi, err.message) }
  }

  // 8. Health Data
  for (const h of extracted.healthData) {
    const val = validateRelationalRow(h, "healthdata", "id_kesehatan")
    if (!val.valid) { logger.skip("healthdata", h.id_kesehatan, val.error!); continue }
    try {
      const data = transformHealthData(h)
      if (!isDryRun) await newPrisma.healthData.create({ data })
      logger.success("healthdata", h.id_kesehatan, data.healthcareProviderName || "-")
    } catch (err: any) { logger.error("healthdata", h.id_kesehatan, err.message) }
  }

  // 9. Kesediaan
  for (const k of extracted.kesediaan) {
    const val = validateRelationalRow(k, "kesediaan", "id_kesediaan")
    if (!val.valid) { logger.skip("kesediaan", k.id_kesediaan, val.error!); continue }
    try {
      const data = transformKesediaan(k)
      if (!isDryRun) await newPrisma.kesediaan.create({ data })
      logger.success("kesediaan", k.id_kesediaan, String(data.isBersedia))
    } catch (err: any) { logger.error("kesediaan", k.id_kesediaan, err.message) }
  }

  // 10. Important Documents (Unpivot)
  for (const d of extracted.documents) {
    const employeeId = idMap.get("pegawai", d.id_pegawai)
    if (!employeeId) {
      logger.skip("importantdocument", d.id_dokumen, `Parent employee not found for id_pegawai=${d.id_pegawai}`)
      continue
    }
    const docs = transformImportantDocuments(d)
    for (const doc of docs) {
      try {
        if (!isDryRun) await newPrisma.importantDocument.create({ data: doc })
        logger.success("importantdocument", `${d.id_dokumen}_${doc.documentType}`, doc.documentType)
      } catch (err: any) { logger.error("importantdocument", `${d.id_dokumen}_${doc.documentType}`, err.message) }
    }
  }

  // 11. DP3
  for (const dp of extracted.dp3) {
    const val = validateRelationalRow(dp, "dp3", "id_dp3")
    if (!val.valid) { logger.skip("dp3", dp.id_dp3, val.error!); continue }
    const tahunStr = String(dp.tahun || "").trim()
    if (!cache.yearsByName[tahunStr]) {
      logger.skip("dp3", dp.id_dp3, `Year ${tahunStr} not found in master`)
      continue
    }
    try {
      const data = transformDP3(dp, cache)
      if (!isDryRun) await newPrisma.dP3.create({ data })
      logger.success("dp3", dp.id_dp3, `Tahun ${dp.tahun} - Skor ${data.jumlah}`)
    } catch (err: any) { logger.error("dp3", dp.id_dp3, err.message) }
  }
}
