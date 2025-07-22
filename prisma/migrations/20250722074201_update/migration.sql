/*
  Warnings:

  - You are about to drop the column `jam` on the `Penumpang` table. All the data in the column will be lost.
  - You are about to alter the column `nama` on the `Penumpang` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `usia` on the `Penumpang` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `tujuan` on the `Penumpang` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `nopol` on the `Penumpang` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `jenisKendaraan` on the `Penumpang` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `golongan` on the `Penumpang` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `kapal` on the `Penumpang` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - Changed the type of `jenisKelamin` on the `Penumpang` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Penumpang" DROP COLUMN "jam",
ALTER COLUMN "nama" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "usia" SET DATA TYPE SMALLINT,
DROP COLUMN "jenisKelamin",
ADD COLUMN     "jenisKelamin" CHAR(1) NOT NULL,
ALTER COLUMN "tujuan" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "tanggal" SET DATA TYPE DATE,
ALTER COLUMN "nopol" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "jenisKendaraan" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "golongan" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "kapal" SET DATA TYPE VARCHAR(50);

-- DropEnum
DROP TYPE "JenisKelamin";
