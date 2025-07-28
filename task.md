Gunakan Server Actions untuk Mutasi Data Penumpang

Masalah: Saat ini, Anda menggunakan API Routes untuk operasi POST, PUT, dan DELETE yang dipanggil dari form di sisi klien ('use client'). Ini menciptakan satu lapisan request jaringan tambahan.

Saran: Untuk Next.js 15, pertimbangkan menggunakan Server Actions. Ini memungkinkan fungsi yang berjalan di server dipanggil langsung dari komponen klien tanpa perlu membuat API endpoint secara manual. Kodenya menjadi lebih sederhana, dan berpotensi mengurangi latensi.

// 1. Definisikan action di file terpisah (misal: app/actions.ts)
'use server';
import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function tambahPenumpang(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  // ... lakukan validasi di sini ...
  await prisma.penumpang.create({ data: { ... } });
  revalidatePath('/dashboard/penumpang'); // Memberi tahu Next.js untuk memuat ulang data di halaman ini
}

// 2. Panggil di komponen Anda
import { tambahPenumpang } from '@/app/actions';

export default function PenumpangPage() {
  return (
    <form action={tambahPenumpang}>
      {/* ... input fields ... */}
      <button type="submit">Simpan</button>
    </form>
  );
}