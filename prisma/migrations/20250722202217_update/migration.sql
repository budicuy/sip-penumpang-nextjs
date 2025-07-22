/*
  Warnings:

  - The primary key for the `Penumpang` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Penumpang` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Changed the type of `jenisKelamin` on the `Penumpang` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `golongan` on the `Penumpang` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "jenisKelamin" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "golongan" AS ENUM ('I', 'II', 'III', 'IVa', 'IVb', 'V', 'VI', 'VII', 'VIII', 'IX');

-- DropIndex
DROP INDEX "idx_penumpang_nama";

-- AlterTable
ALTER TABLE "Penumpang" DROP CONSTRAINT "Penumpang_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "jenisKelamin",
ADD COLUMN     "jenisKelamin" "jenisKelamin" NOT NULL,
DROP COLUMN "golongan",
ADD COLUMN     "golongan" "golongan" NOT NULL,
ADD CONSTRAINT "Penumpang_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255);

-- CreateIndex
CREATE INDEX "idx_penumpang_nama_tujuan_nopol_kapal_jenisKendaraan" ON "Penumpang"("nama", "tujuan", "nopol", "kapal", "jenisKendaraan");

-- CreateIndex
CREATE INDEX "idx_penumpang_id" ON "Penumpang"("id");
