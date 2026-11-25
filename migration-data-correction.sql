-- Migration: Add DataCorrectionRequest table
-- Run this SQL on your production MySQL database (simka9) before deploying the new version

CREATE TABLE IF NOT EXISTS `DataCorrectionRequest` (
  `id` VARCHAR(191) NOT NULL,
  `employeeId` VARCHAR(191) NOT NULL,
  `requestedById` VARCHAR(191) NOT NULL,
  `fieldKey` VARCHAR(191) NOT NULL,
  `fieldLabel` VARCHAR(191) NOT NULL,
  `oldValue` TEXT NULL,
  `newValue` TEXT NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `reviewedById` VARCHAR(191) NULL,
  `reviewNote` TEXT NULL,
  `reviewedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `DataCorrectionRequest_employeeId_status_idx`(`employeeId`, `status`),
  INDEX `DataCorrectionRequest_status_createdAt_idx`(`status`, `createdAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `DataCorrectionRequest_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `DataCorrectionRequest_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `DataCorrectionRequest_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
