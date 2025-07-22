/*
  Warnings:

  - The primary key for the `Penumpang` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Penumpang" DROP CONSTRAINT "Penumpang_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(20),
ADD CONSTRAINT "Penumpang_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Penumpang_id_seq";
