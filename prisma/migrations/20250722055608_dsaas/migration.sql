/*
  Warnings:

  - Added the required column `jam` to the `Penumpang` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Penumpang" ADD COLUMN     "jam" TIMESTAMP(3) NOT NULL;
