-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penumpang" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "usia" SMALLINT NOT NULL,
    "jenisKelamin" CHAR(1) NOT NULL,
    "tujuan" VARCHAR(255) NOT NULL,
    "tanggal" DATE NOT NULL,
    "nopol" VARCHAR(15) NOT NULL,
    "jenisKendaraan" VARCHAR(255) NOT NULL,
    "golongan" VARCHAR(10) NOT NULL,
    "kapal" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penumpang_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
