const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const schemaSqlPath = path.join(__dirname, "..", "prisma_schema.sql");
const schemaBuffer = fs.readFileSync(schemaSqlPath);
// Detect UTF-16 LE (FF FE BOM)
const schemaSql = (schemaBuffer[0] === 0xff && schemaBuffer[1] === 0xfe)
  ? schemaBuffer.toString("utf16le").replace(/^\uFEFF/, "")
  : schemaBuffer.toString("utf-8");

const hash = bcrypt.hashSync("admin123", 10);

const seedSql = `
-- ==========================================
-- DATA AWAL (SEED) SIMKA 9
-- ==========================================

-- Master Departments
INSERT INTO \`Department\` (\`id\`, \`code\`, \`name\`, \`description\`, \`departmentType\`, \`canTeach\`, \`isActive\`, \`createdAt\`, \`updatedAt\`) VALUES
('dept_yayasan', 'YAYASAN', 'Yayasan', 'Pengurus Yayasan Al Wathoniyah 9', 'YAYASAN', 0, 1, NOW(3), NOW(3)),
('dept_tu', 'TU', 'Tata Usaha', 'Staff administrasi dan tata usaha', 'SEKOLAH', 0, 1, NOW(3), NOW(3)),
('dept_tk', 'TK', 'TK Al Wathoniyah', 'Taman Kanak-kanak', 'SEKOLAH', 1, 1, NOW(3), NOW(3)),
('dept_mi', 'MI', 'MI Al Wathoniyah', 'Madrasah Ibtidaiyah', 'SEKOLAH', 1, 1, NOW(3), NOW(3)),
('dept_mts', 'MTS', 'MTs Al Wathoniyah', 'Madrasah Tsanawiyah', 'SEKOLAH', 1, 1, NOW(3), NOW(3)),
('dept_ma', 'MA', 'MA Al Wathoniyah', 'Madrasah Aliyah', 'SEKOLAH', 1, 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);

-- Master Positions
INSERT INTO \`Position\` (\`id\`, \`name\`, \`description\`, \`positionType\`, \`isActive\`, \`createdAt\`, \`updatedAt\`) VALUES
('pos_kepsek', 'Kepala Sekolah', 'Kepala Sekolah', 'SEKOLAH', 1, NOW(3), NOW(3)),
('pos_wakepsek', 'Wakil Kepala Sekolah', 'Wakil Kepala Sekolah', 'SEKOLAH', 1, NOW(3), NOW(3)),
('pos_guru', 'Guru', 'Tenaga Pendidik', 'SEKOLAH', 1, NOW(3), NOW(3)),
('pos_gurubk', 'Guru BK', 'Bimbingan Konseling', 'SEKOLAH', 1, NOW(3), NOW(3)),
('pos_tu', 'Staff Tata Usaha', 'Administrasi Sekolah', 'SEKOLAH', 1, NOW(3), NOW(3)),
('pos_bendahara', 'Bendahara', 'Pengelola Keuangan', 'SEKOLAH', 1, NOW(3), NOW(3)),
('pos_pustakawan', 'Pustakawan', 'Perpustakaan', 'SEKOLAH', 1, NOW(3), NOW(3)),
('pos_operator', 'Operator', 'Operator Sekolah', 'SEKOLAH', 1, NOW(3), NOW(3)),
('pos_satpam', 'Satpam', 'Keamanan', 'SEKOLAH', 1, NOW(3), NOW(3)),
('pos_penjaga', 'Penjaga Sekolah', 'Kebersihan dan Fasilitas', 'SEKOLAH', 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);

-- Master Employment Status
INSERT INTO \`EmploymentStatusMaster\` (\`id\`, \`name\`, \`isActive\`, \`createdAt\`) VALUES
('emp_pns', 'PNS', 1, NOW(3)),
('emp_pppk', 'PPPK', 1, NOW(3)),
('emp_gty', 'Guru Tetap Yayasan', 1, NOW(3)),
('emp_honorer', 'Honorer', 1, NOW(3)),
('emp_kontrak', 'Kontrak', 1, NOW(3)),
('emp_magang', 'Magang', 1, NOW(3))
ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);

-- Master Religions
INSERT INTO \`Religion\` (\`id\`, \`name\`, \`isActive\`) VALUES
('rel_islam', 'Islam', 1),
('rel_protestan', 'Kristen Protestan', 1),
('rel_katolik', 'Kristen Katolik', 1),
('rel_hindu', 'Hindu', 1),
('rel_buddha', 'Buddha', 1),
('rel_konghucu', 'Konghucu', 1)
ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);

-- Master Blood Types
INSERT INTO \`BloodType\` (\`id\`, \`name\`, \`isActive\`) VALUES
('bt_a', 'A', 1),
('bt_b', 'B', 1),
('bt_ab', 'AB', 1),
('bt_o', 'O', 1)
ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);

-- Master Education
INSERT INTO \`Education\` (\`id\`, \`name\`, \`level\`, \`isActive\`, \`createdAt\`, \`updatedAt\`) VALUES
('edu_sd', 'SD', 'SD', 1, NOW(3), NOW(3)),
('edu_smp', 'SMP', 'SMP', 1, NOW(3), NOW(3)),
('edu_sma', 'SMA', 'SMA', 1, NOW(3), NOW(3)),
('edu_smk', 'SMK', 'SMK', 1, NOW(3), NOW(3)),
('edu_d1', 'D1', 'Diploma', 1, NOW(3), NOW(3)),
('edu_d2', 'D2', 'Diploma', 1, NOW(3), NOW(3)),
('edu_d3', 'D3', 'Diploma', 1, NOW(3), NOW(3)),
('edu_d4', 'D4', 'Diploma', 1, NOW(3), NOW(3)),
('edu_s1', 'S1', 'Sarjana', 1, NOW(3), NOW(3)),
('edu_s2', 'S2', 'Sarjana', 1, NOW(3), NOW(3)),
('edu_s3', 'S3', 'Sarjana', 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);

-- Master Status DP3
INSERT INTO \`StatusDP3\` (\`id\`, \`name\`, \`order\`, \`isActive\`, \`createdAt\`, \`updatedAt\`) VALUES
('sdp3_draft', 'DRAFT', 1, 1, NOW(3), NOW(3)),
('sdp3_yayasan1', 'MENUNGGU_APPROVAL_YAYASAN_1', 2, 1, NOW(3), NOW(3)),
('sdp3_yayasan2', 'MENUNGGU_APPROVAL_YAYASAN_2', 3, 1, NOW(3), NOW(3)),
('sdp3_approved', 'APPROVED', 4, 1, NOW(3), NOW(3)),
('sdp3_rejected', 'REJECTED', 5, 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);

-- App Configuration
INSERT INTO \`AppConfiguration\` (\`id\`, \`appName\`, \`appOwner\`, \`primaryColor\`, \`secondaryColor\`, \`createdAt\`, \`updatedAt\`) VALUES
('config_default', 'SIMKA', 'Al Wathoniyah 9', '#0f172a', '#3b82f6', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE \`appName\`=VALUES(\`appName\`);

-- Initial Employees
INSERT INTO \`Employee\` (
  \`id\`, \`employeeIdNumber\`, \`fullName\`, \`departmentId\`, \`positionId\`, \`employmentStatusId\`,
  \`religionId\`, \`bloodTypeId\`, \`gender\`, \`maritalStatus\`, \`employmentStatus\`,
  \`dateOfBirth\`, \`joinDate\`, \`highestEducation\`, \`major\`, \`institutionName\`,
  \`graduationYear\`, \`placeOfBirth\`, \`province\`, \`address\`, \`postalCode\`,
  \`phoneNumber\`, \`email\`, \`createdAt\`, \`updatedAt\`
) VALUES
('emp_admin', 'ADMIN001', 'Super Administrator', 'dept_yayasan', 'pos_kepsek', 'emp_pns', 'rel_islam', 'bt_a', 'LAKI_LAKI', 'MENIKAH', 'AKTIF', '1980-01-01', '2005-01-01', 'S2', 'Manajemen', 'UIN Jakarta', 2004, 'Jakarta', 'DKI Jakarta', 'Jakarta Timur', '13760', '081234567890', 'admin@alwathoniyah9.sch.id', NOW(3), NOW(3)),
('emp_hr', '197501012005011001', 'Staff HR Kepegawaian', 'dept_tu', 'pos_tu', 'emp_pns', 'rel_islam', 'bt_a', 'LAKI_LAKI', 'MENIKAH', 'AKTIF', '1975-01-01', '2005-01-01', 'S1', 'Administrasi', 'UIN Jakarta', 2000, 'Jakarta', 'DKI Jakarta', 'Jakarta Timur', '13760', '081234567891', 'hr@alwathoniyah9.sch.id', NOW(3), NOW(3)),
('emp_pimpinan', '197808192002011013', 'H. Zainal Abidin, S.H., M.H.', 'dept_yayasan', 'pos_kepsek', 'emp_pns', 'rel_islam', 'bt_a', 'LAKI_LAKI', 'MENIKAH', 'AKTIF', '1978-08-19', '2002-01-01', 'S2', 'Hukum', 'Universitas Indonesia', 2004, 'Jakarta', 'DKI Jakarta', 'Jakarta Timur', '13760', '081234567892', 'pimpinan@alwathoniyah9.sch.id', NOW(3), NOW(3)),
('emp_pegawai', '198203052010012002', 'Siti Aisyah, S.Pd.', 'dept_ma', 'pos_guru', 'emp_gty', 'rel_islam', 'bt_a', 'PEREMPUAN', 'MENIKAH', 'AKTIF', '1982-03-05', '2010-01-01', 'S1', 'Pendidikan Bahasa Arab', 'UIN Jakarta', 2008, 'Jakarta', 'DKI Jakarta', 'Jakarta Timur', '13760', '081234567893', 'pegawai@alwathoniyah9.sch.id', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE \`fullName\`=VALUES(\`fullName\`);

-- Users (Password: admin123)
INSERT INTO \`User\` (\`id\`, \`name\`, \`email\`, \`nip\`, \`passwordHash\`, \`role\`, \`isActive\`, \`employeeId\`, \`createdAt\`, \`updatedAt\`) VALUES
('usr_admin', 'Super Administrator', 'admin@alwathoniyah9.sch.id', 'ADMIN001', '${hash}', 'SUPER_ADMIN', 1, 'emp_admin', NOW(3), NOW(3)),
('usr_hr', 'Staff HR Kepegawaian', 'hr@alwathoniyah9.sch.id', '197501012005011001', '${hash}', 'HR', 1, 'emp_hr', NOW(3), NOW(3)),
('usr_pimpinan', 'H. Zainal Abidin, S.H., M.H.', 'pimpinan@alwathoniyah9.sch.id', '197808192002011013', '${hash}', 'PIMPINAN', 1, 'emp_pimpinan', NOW(3), NOW(3)),
('usr_pegawai', 'Siti Aisyah, S.Pd.', 'pegawai@alwathoniyah9.sch.id', '198203052010012002', '${hash}', 'PEGAWAI', 1, 'emp_pegawai', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE \`passwordHash\`=VALUES(\`passwordHash\`);
`;

const finalSql = `-- ==========================================
-- SKEMA LENGKAP & DATA AWAL SIMKA 9
-- DATABASE MYSQL / MARIADB
-- ==========================================

SET FOREIGN_KEY_CHECKS = 0;

${schemaSql}

${seedSql}

SET FOREIGN_KEY_CHECKS = 1;
`;

fs.writeFileSync(path.join(__dirname, "..", "database_simka.sql"), finalSql, "utf-8");
console.log("✔ Berhasil membuat file database_simka.sql!");
