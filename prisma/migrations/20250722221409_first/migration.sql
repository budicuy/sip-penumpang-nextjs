-- CreateEnum
CREATE TYPE "jenisKelamin" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "golongan" AS ENUM ('I', 'II', 'III', 'IVa', 'IVb', 'V', 'VI', 'VII', 'VIII', 'IX');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penumpang" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "usia" SMALLINT NOT NULL,
    "jenisKelamin" "jenisKelamin" NOT NULL,
    "tujuan" VARCHAR(255) NOT NULL,
    "tanggal" DATE NOT NULL,
    "nopol" VARCHAR(10) NOT NULL,
    "jenisKendaraan" VARCHAR(255) NOT NULL,
    "golongan" "golongan" NOT NULL,
    "kapal" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penumpang_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_id" ON "User"("id");

-- CreateIndex
CREATE INDEX "idx_penumpang_nama_tujuan_nopol_kapal_jenisKendaraan" ON "Penumpang"("nama", "tujuan", "nopol", "kapal", "jenisKendaraan");

-- CreateIndex
CREATE INDEX "idx_penumpang_id" ON "Penumpang"("id");
