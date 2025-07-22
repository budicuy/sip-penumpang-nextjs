-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `idx_user_email`(`email`),
    INDEX `idx_user_id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Penumpang` (
    `id` CHAR(20) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `usia` TINYINT UNSIGNED NOT NULL,
    `jenisKelamin` CHAR(1) NOT NULL,
    `tujuan` VARCHAR(255) NOT NULL,
    `tanggal` DATE NOT NULL,
    `nopol` VARCHAR(10) NOT NULL,
    `jenisKendaraan` VARCHAR(255) NOT NULL,
    `golongan` VARCHAR(4) NOT NULL,
    `kapal` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `idx_penumpang_nama`(`nama`),
    INDEX `idx_penumpang_id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
