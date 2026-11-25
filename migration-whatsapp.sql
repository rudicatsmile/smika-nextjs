-- Migration: Add WhatsApp Gateway fields to AppConfiguration & create WhatsAppLog table
-- Run this SQL on your production MySQL database (simka9) before deploying the new version

ALTER TABLE `AppConfiguration`
  ADD COLUMN `waEnabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `waProvider` VARCHAR(191) NOT NULL DEFAULT 'FONNTE',
  ADD COLUMN `waApiUrl` VARCHAR(191) NULL,
  ADD COLUMN `waApiToken` VARCHAR(191) NULL;

CREATE TABLE IF NOT EXISTS `WhatsAppLog` (
  `id` VARCHAR(191) NOT NULL,
  `employeeId` VARCHAR(191) NULL,
  `phoneNumber` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `provider` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `response` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `WhatsAppLog_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
