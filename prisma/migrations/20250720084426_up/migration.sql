-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LakiLaki', 'Perempuan');

-- CreateTable
CREATE TABLE "Penumpang" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "usia" INTEGER NOT NULL,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "tujuan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jam" TIMESTAMP(3) NOT NULL,
    "nopol" TEXT NOT NULL,
    "jenisKendaraan" TEXT NOT NULL,
    "golongan" TEXT NOT NULL,
    "kapal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penumpang_pkey" PRIMARY KEY ("id")
);
