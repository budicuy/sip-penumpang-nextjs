import { PrismaClient } from '@prisma/client';

// Deklarasikan global.prisma untuk menyimpan instance tunggal.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Gunakan instance yang ada atau buat yang baru.
export const prisma = global.prisma || new PrismaClient();

// Di lingkungan non-produksi, simpan instance ke global.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
