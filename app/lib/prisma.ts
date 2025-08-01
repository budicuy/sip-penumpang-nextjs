import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Deklarasikan global.prisma untuk menyimpan instance tunggal.
declare global {
  var prisma: ReturnType<typeof createPrismaClient> | undefined;
}

// Fungsi untuk membuat Prisma client dengan extensions
function createPrismaClient() {
  const basePrisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : [],
  });

  // Tambahkan extension Accelerate dan Optimize
  return basePrisma
    .$extends(withAccelerate())
}

// Gunakan instance yang ada atau buat yang baru.
export const prisma = global.prisma || createPrismaClient();

// Di lingkungan non-produksi, simpan instance ke global.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
