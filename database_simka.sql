-- ==========================================
-- SKEMA LENGKAP & DATA AWAL SIMKA 9
-- DATABASE MYSQL / MARIADB
-- ==========================================

SET FOREIGN_KEY_CHECKS = 0;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `nip` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'HR', 'PIMPINAN', 'PEMILIK_YAYASAN_1', 'PEMILIK_YAYASAN_2', 'PEGAWAI') NOT NULL DEFAULT 'PEGAWAI',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `employeeId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_nip_key`(`nip`),
    UNIQUE INDEX `User_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PositionDepartment` (
    `id` VARCHAR(191) NOT NULL,
    `positionId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PositionDepartment_positionId_departmentId_key`(`positionId`, `departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `departmentType` ENUM('SEKOLAH', 'YAYASAN', 'SEKURITI', 'MAINTENANCE') NOT NULL DEFAULT 'SEKOLAH',
    `canTeach` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Department_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Position` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `positionType` ENUM('SEKOLAH', 'YAYASAN') NOT NULL DEFAULT 'SEKOLAH',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Position_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmploymentStatusMaster` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EmploymentStatusMaster_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Religion` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Religion_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BloodType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `BloodType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Education` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Education_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subject` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `urutan` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subject_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EducationHistory` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `educationId` VARCHAR(191) NOT NULL,
    `institutionName` VARCHAR(191) NULL,
    `major` VARCHAR(191) NULL,
    `graduationYear` INTEGER NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `gpa` DOUBLE NULL,
    `isGraduated` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Occupation` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Occupation_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Year` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Year_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StatusDP3` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StatusDP3_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Child` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `placeOfBirth` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `gender` ENUM('LAKI_LAKI', 'PEREMPUAN') NULL,
    `relationship` VARCHAR(191) NULL,
    `educationId` VARCHAR(191) NULL,
    `occupationId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Spouse` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `placeOfBirth` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `gender` ENUM('LAKI_LAKI', 'PEREMPUAN') NULL,
    `relationship` VARCHAR(191) NULL,
    `educationId` VARCHAR(191) NULL,
    `occupationId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Training` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `organizerLocation` VARCHAR(191) NULL,
    `batch` VARCHAR(191) NULL,
    `date` DATETIME(3) NULL,
    `certificateNumber` VARCHAR(191) NULL,
    `certificateDate` DATETIME(3) NULL,
    `certificateFile` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmploymentDocument` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `letterName` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NULL,
    `number` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `file` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certification` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `isCertifiedTeacher` BOOLEAN NOT NULL,
    `certificationBaseSchool` VARCHAR(191) NULL,
    `educationCertificateNumber` VARCHAR(191) NULL,
    `certificationYear` INTEGER NULL,
    `inpassingBaseSchool` VARCHAR(191) NULL,
    `inpassingSkNumber` VARCHAR(191) NULL,
    `inpassingSkYear` INTEGER NULL,
    `file` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkUnit` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `worksElsewhere` BOOLEAN NOT NULL,
    `workplaceName` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `positionFunction` VARCHAR(191) NULL,
    `workplaceAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HealthData` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `healthcareProviderName` VARCHAR(191) NULL,
    `level1HealthFacility` VARCHAR(191) NULL,
    `bpjsNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocialOrganization` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `organizationName` VARCHAR(191) NULL,
    `organizationAddress` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `joinDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportantDocument` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `documentType` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kesediaan` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `isBersedia` BOOLEAN NOT NULL,
    `alasanKesanggupan` VARCHAR(191) NULL,
    `kesediaanHariKerja` VARCHAR(191) NULL,
    `photo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DP3` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `tahunId` VARCHAR(191) NOT NULL,
    `statusDP3Id` VARCHAR(191) NOT NULL,
    `kualitasKerjaNilai` INTEGER NOT NULL,
    `kualitasKerjaAlasan` VARCHAR(191) NULL,
    `kehadiranDanKedisiplinanNilai` INTEGER NOT NULL,
    `kehadiranDanKedisiplinanAlasan` VARCHAR(191) NULL,
    `kerjasamaTimNilai` INTEGER NOT NULL,
    `kerjasamaTimAlasan` VARCHAR(191) NULL,
    `komitmenVisiMisiNilai` INTEGER NOT NULL,
    `komitmenVisiMisiAlasan` VARCHAR(191) NULL,
    `pengembanganDiriNilai` INTEGER NOT NULL,
    `pengembanganDiriAlasan` VARCHAR(191) NULL,
    `penggunaanTeknologiNilai` INTEGER NOT NULL,
    `penggunaanTeknologiAlasan` VARCHAR(191) NULL,
    `ketaatanKepatuhanNilai` INTEGER NOT NULL,
    `ketaatanKepatuhanAlasan` VARCHAR(191) NULL,
    `komunikasiEfektifNilai` INTEGER NOT NULL,
    `komunikasiEfektifAlasan` VARCHAR(191) NULL,
    `inisiatifProblemSolvingNilai` INTEGER NOT NULL,
    `inisiatifProblemSolvingAlasan` VARCHAR(191) NULL,
    `jumlah` INTEGER NOT NULL,
    `rataRata` INTEGER NOT NULL,
    `bobot` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` VARCHAR(191) NOT NULL,
    `employeeIdNumber` VARCHAR(191) NOT NULL,
    `nationalIdNumber` VARCHAR(191) NULL,
    `bpjsNumber` VARCHAR(191) NULL,
    `taxIdNumber` VARCHAR(191) NULL,
    `educatorIdNumber` VARCHAR(191) NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `profilePhoto` VARCHAR(191) NULL,
    `placeOfBirth` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `gender` ENUM('LAKI_LAKI', 'PEREMPUAN') NULL,
    `maritalStatus` ENUM('BELUM_MENIKAH', 'MENIKAH', 'CERAI_HIDUP', 'CERAI_MATI') NULL,
    `employmentStatus` ENUM('AKTIF', 'NON_AKTIF', 'CUTI', 'PENSIUN') NOT NULL DEFAULT 'AKTIF',
    `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    `address` VARCHAR(191) NULL,
    `province` VARCHAR(191) NULL,
    `postalCode` VARCHAR(191) NULL,
    `secondaryAddress` VARCHAR(191) NULL,
    `secondaryProvince` VARCHAR(191) NULL,
    `secondaryPostalCode` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `hobbies` VARCHAR(191) NULL,
    `height` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `positionUnit` VARCHAR(191) NULL,
    `positionData` VARCHAR(191) NULL,
    `functionUnit` VARCHAR(191) NULL,
    `taskUnit` VARCHAR(191) NULL,
    `teachingUnit` VARCHAR(191) NULL,
    `subjectId` VARCHAR(191) NULL,
    `joinDate` DATETIME(3) NULL,
    `highestEducation` VARCHAR(191) NULL,
    `major` VARCHAR(191) NULL,
    `institutionName` VARCHAR(191) NULL,
    `graduationYear` INTEGER NULL,
    `departmentId` VARCHAR(191) NULL,
    `positionId` VARCHAR(191) NULL,
    `employmentStatusId` VARCHAR(191) NULL,
    `religionId` VARCHAR(191) NULL,
    `bloodTypeId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Employee_employeeIdNumber_key`(`employeeIdNumber`),
    UNIQUE INDEX `Employee_nationalIdNumber_key`(`nationalIdNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeDocument` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeHistory` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `meta` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppConfiguration` (
    `id` VARCHAR(191) NOT NULL,
    `appName` VARCHAR(191) NOT NULL DEFAULT 'SIMKA',
    `appOwner` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `faviconUrl` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `facebookUrl` VARCHAR(191) NULL,
    `instagramUrl` VARCHAR(191) NULL,
    `youtubeUrl` VARCHAR(191) NULL,
    `primaryColor` VARCHAR(191) NOT NULL DEFAULT '#0f172a',
    `secondaryColor` VARCHAR(191) NOT NULL DEFAULT '#3b82f6',
    `motto` VARCHAR(191) NULL,
    `vision` VARCHAR(191) NULL,
    `mission` VARCHAR(191) NULL,
    `copyright` VARCHAR(191) NULL,
    `footerText` VARCHAR(191) NULL,
    `activeYearId` VARCHAR(191) NULL,
    `activeSemester` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PositionDepartment` ADD CONSTRAINT `PositionDepartment_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `Position`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PositionDepartment` ADD CONSTRAINT `PositionDepartment_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EducationHistory` ADD CONSTRAINT `EducationHistory_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EducationHistory` ADD CONSTRAINT `EducationHistory_educationId_fkey` FOREIGN KEY (`educationId`) REFERENCES `Education`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Child` ADD CONSTRAINT `Child_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Child` ADD CONSTRAINT `Child_educationId_fkey` FOREIGN KEY (`educationId`) REFERENCES `Education`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Child` ADD CONSTRAINT `Child_occupationId_fkey` FOREIGN KEY (`occupationId`) REFERENCES `Occupation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Spouse` ADD CONSTRAINT `Spouse_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Spouse` ADD CONSTRAINT `Spouse_educationId_fkey` FOREIGN KEY (`educationId`) REFERENCES `Education`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Spouse` ADD CONSTRAINT `Spouse_occupationId_fkey` FOREIGN KEY (`occupationId`) REFERENCES `Occupation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Training` ADD CONSTRAINT `Training_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmploymentDocument` ADD CONSTRAINT `EmploymentDocument_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certification` ADD CONSTRAINT `Certification_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkUnit` ADD CONSTRAINT `WorkUnit_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HealthData` ADD CONSTRAINT `HealthData_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialOrganization` ADD CONSTRAINT `SocialOrganization_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImportantDocument` ADD CONSTRAINT `ImportantDocument_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kesediaan` ADD CONSTRAINT `Kesediaan_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DP3` ADD CONSTRAINT `DP3_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DP3` ADD CONSTRAINT `DP3_tahunId_fkey` FOREIGN KEY (`tahunId`) REFERENCES `Year`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DP3` ADD CONSTRAINT `DP3_statusDP3Id_fkey` FOREIGN KEY (`statusDP3Id`) REFERENCES `StatusDP3`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `Position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_employmentStatusId_fkey` FOREIGN KEY (`employmentStatusId`) REFERENCES `EmploymentStatusMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_religionId_fkey` FOREIGN KEY (`religionId`) REFERENCES `Religion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_bloodTypeId_fkey` FOREIGN KEY (`bloodTypeId`) REFERENCES `BloodType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeDocument` ADD CONSTRAINT `EmployeeDocument_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeHistory` ADD CONSTRAINT `EmployeeHistory_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppConfiguration` ADD CONSTRAINT `AppConfiguration_activeYearId_fkey` FOREIGN KEY (`activeYearId`) REFERENCES `Year`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;




-- ==========================================
-- DATA AWAL (SEED) SIMKA 9
-- ==========================================

-- Master Departments
INSERT INTO `Department` (`id`, `code`, `name`, `description`, `departmentType`, `canTeach`, `isActive`, `createdAt`, `updatedAt`) VALUES
('dept_yayasan', 'YAYASAN', 'Yayasan', 'Pengurus Yayasan Al Wathoniyah 9', 'YAYASAN', 0, 1, NOW(3), NOW(3)),
('dept_tu', 'TU', 'Tata Usaha', 'Staff administrasi dan tata usaha', 'SEKOLAH', 0, 1, NOW(3), NOW(3)),
('dept_tk', 'TK', 'TK Al Wathoniyah', 'Taman Kanak-kanak', 'SEKOLAH', 1, 1, NOW(3), NOW(3)),
('dept_mi', 'MI', 'MI Al Wathoniyah', 'Madrasah Ibtidaiyah', 'SEKOLAH', 1, 1, NOW(3), NOW(3)),
('dept_mts', 'MTS', 'MTs Al Wathoniyah', 'Madrasah Tsanawiyah', 'SEKOLAH', 1, 1, NOW(3), NOW(3)),
('dept_ma', 'MA', 'MA Al Wathoniyah', 'Madrasah Aliyah', 'SEKOLAH', 1, 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Master Positions
INSERT INTO `Position` (`id`, `name`, `description`, `positionType`, `isActive`, `createdAt`, `updatedAt`) VALUES
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
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Master Employment Status
INSERT INTO `EmploymentStatusMaster` (`id`, `name`, `isActive`, `createdAt`) VALUES
('emp_pns', 'PNS', 1, NOW(3)),
('emp_pppk', 'PPPK', 1, NOW(3)),
('emp_gty', 'Guru Tetap Yayasan', 1, NOW(3)),
('emp_honorer', 'Honorer', 1, NOW(3)),
('emp_kontrak', 'Kontrak', 1, NOW(3)),
('emp_magang', 'Magang', 1, NOW(3))
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Master Religions
INSERT INTO `Religion` (`id`, `name`, `isActive`) VALUES
('rel_islam', 'Islam', 1),
('rel_protestan', 'Kristen Protestan', 1),
('rel_katolik', 'Kristen Katolik', 1),
('rel_hindu', 'Hindu', 1),
('rel_buddha', 'Buddha', 1),
('rel_konghucu', 'Konghucu', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Master Blood Types
INSERT INTO `BloodType` (`id`, `name`, `isActive`) VALUES
('bt_a', 'A', 1),
('bt_b', 'B', 1),
('bt_ab', 'AB', 1),
('bt_o', 'O', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Master Education
INSERT INTO `Education` (`id`, `name`, `level`, `isActive`, `createdAt`, `updatedAt`) VALUES
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
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Master Status DP3
INSERT INTO `StatusDP3` (`id`, `name`, `order`, `isActive`, `createdAt`, `updatedAt`) VALUES
('sdp3_draft', 'DRAFT', 1, 1, NOW(3), NOW(3)),
('sdp3_yayasan1', 'MENUNGGU_APPROVAL_YAYASAN_1', 2, 1, NOW(3), NOW(3)),
('sdp3_yayasan2', 'MENUNGGU_APPROVAL_YAYASAN_2', 3, 1, NOW(3), NOW(3)),
('sdp3_approved', 'APPROVED', 4, 1, NOW(3), NOW(3)),
('sdp3_rejected', 'REJECTED', 5, 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- App Configuration
INSERT INTO `AppConfiguration` (`id`, `appName`, `appOwner`, `primaryColor`, `secondaryColor`, `createdAt`, `updatedAt`) VALUES
('config_default', 'SIMKA', 'Al Wathoniyah 9', '#0f172a', '#3b82f6', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `appName`=VALUES(`appName`);

-- Initial Employees
INSERT INTO `Employee` (
  `id`, `employeeIdNumber`, `fullName`, `departmentId`, `positionId`, `employmentStatusId`,
  `religionId`, `bloodTypeId`, `gender`, `maritalStatus`, `employmentStatus`,
  `dateOfBirth`, `joinDate`, `highestEducation`, `major`, `institutionName`,
  `graduationYear`, `placeOfBirth`, `province`, `address`, `postalCode`,
  `phoneNumber`, `email`, `createdAt`, `updatedAt`
) VALUES
('emp_admin', 'ADMIN001', 'Super Administrator', 'dept_yayasan', 'pos_kepsek', 'emp_pns', 'rel_islam', 'bt_a', 'LAKI_LAKI', 'MENIKAH', 'AKTIF', '1980-01-01', '2005-01-01', 'S2', 'Manajemen', 'UIN Jakarta', 2004, 'Jakarta', 'DKI Jakarta', 'Jakarta Timur', '13760', '081234567890', 'admin@alwathoniyah9.sch.id', NOW(3), NOW(3)),
('emp_hr', '197501012005011001', 'Staff HR Kepegawaian', 'dept_tu', 'pos_tu', 'emp_pns', 'rel_islam', 'bt_a', 'LAKI_LAKI', 'MENIKAH', 'AKTIF', '1975-01-01', '2005-01-01', 'S1', 'Administrasi', 'UIN Jakarta', 2000, 'Jakarta', 'DKI Jakarta', 'Jakarta Timur', '13760', '081234567891', 'hr@alwathoniyah9.sch.id', NOW(3), NOW(3)),
('emp_pimpinan', '197808192002011013', 'H. Zainal Abidin, S.H., M.H.', 'dept_yayasan', 'pos_kepsek', 'emp_pns', 'rel_islam', 'bt_a', 'LAKI_LAKI', 'MENIKAH', 'AKTIF', '1978-08-19', '2002-01-01', 'S2', 'Hukum', 'Universitas Indonesia', 2004, 'Jakarta', 'DKI Jakarta', 'Jakarta Timur', '13760', '081234567892', 'pimpinan@alwathoniyah9.sch.id', NOW(3), NOW(3)),
('emp_pegawai', '198203052010012002', 'Siti Aisyah, S.Pd.', 'dept_ma', 'pos_guru', 'emp_gty', 'rel_islam', 'bt_a', 'PEREMPUAN', 'MENIKAH', 'AKTIF', '1982-03-05', '2010-01-01', 'S1', 'Pendidikan Bahasa Arab', 'UIN Jakarta', 2008, 'Jakarta', 'DKI Jakarta', 'Jakarta Timur', '13760', '081234567893', 'pegawai@alwathoniyah9.sch.id', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `fullName`=VALUES(`fullName`);

-- Users
INSERT INTO `User` (`id`, `name`, `email`, `nip`, `passwordHash`, `role`, `isActive`, `employeeId`, `createdAt`, `updatedAt`) VALUES
('usr_admin', 'Super Administrator', 'admin@alwathoniyah9.sch.id', 'admin*U^TYu5', '$2b$10$XpsccNYTYUYZKZsJhg4LXeUf8Acj8KnLwbwLQPPB.yYXEt7L5hx.K', 'SUPER_ADMIN', 1, 'emp_admin', NOW(3), NOW(3)),
('usr_hr', 'Staff HR Kepegawaian', 'hr@alwathoniyah9.sch.id', '197501012005011001', '$2b$10$XpsccNYTYUYZKZsJhg4LXeUf8Acj8KnLwbwLQPPB.yYXEt7L5hx.K', 'HR', 1, 'emp_hr', NOW(3), NOW(3)),
('usr_pimpinan', 'H. Zainal Abidin, S.H., M.H.', 'pimpinan@alwathoniyah9.sch.id', '197808192002011013', '$2b$10$XpsccNYTYUYZKZsJhg4LXeUf8Acj8KnLwbwLQPPB.yYXEt7L5hx.K', 'PIMPINAN', 1, 'emp_pimpinan', NOW(3), NOW(3)),
('usr_pegawai', 'Siti Aisyah, S.Pd.', 'pegawai@alwathoniyah9.sch.id', '198203052010012002', '$2b$10$XpsccNYTYUYZKZsJhg4LXeUf8Acj8KnLwbwLQPPB.yYXEt7L5hx.K', 'PEGAWAI', 1, 'emp_pegawai', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `passwordHash`=VALUES(`passwordHash`), `nip`=VALUES(`nip`), `isActive`=1;


SET FOREIGN_KEY_CHECKS = 1;
