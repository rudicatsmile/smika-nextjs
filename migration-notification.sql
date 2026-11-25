-- Migration: Add Notification table
-- Run this SQL on your production MySQL database (simka9) before deploying the new version

CREATE TABLE IF NOT EXISTS `Notification` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `link` VARCHAR(191) NULL,
  `readAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `Notification_userId_readAt_idx`(`userId`, `readAt`),
  INDEX `Notification_userId_createdAt_idx`(`userId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
