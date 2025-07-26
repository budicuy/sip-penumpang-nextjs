-- CreateEnum
CREATE TYPE "role" AS ENUM ('USER', 'MANAGER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "role" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "idx_user_role" ON "User"("role");
