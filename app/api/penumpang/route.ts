import { NextResponse, NextRequest } from 'next/server';
import { Prisma, Role } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/auth';
import { prisma } from '@/app/lib/prisma'; // Menggunakan prisma client dengan Accelerate & Optimize

/**
 * Membersihkan input pencarian untuk mencegah kerentanan dasar.
 * @param search - String pencarian dari query URL.
 * @returns String pencarian yang sudah dibersihkan.
 */
function sanitizeSearchInput(search: string): string {
    if (!search) return '';
    // Menghapus karakter yang berpotensi bahaya dan membatasi panjangnya.
    return search.trim().replace(/[<>"']/g, '').substring(0, 100);
}

/**
 * Handler untuk metode GET. Mengambil data penumpang dengan paginasi, pencarian, dan filter tanggal.
 * Akses dibatasi berdasarkan peran pengguna.
 */
export async function GET(request: NextRequest) {
    // Mengambil sesi pengguna dari sisi server.
    const session = await getServerSession(authOptions);

    // Jika tidak ada sesi atau pengguna, kembalikan error 401 Unauthorized.
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Otentikasi gagal' }, { status: 401 });
    }
    const user = session.user as { id: string; role: Role };

    try {
        const { searchParams } = new URL(request.url);
        // Mengambil dan memvalidasi parameter dari query URL.
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(10000, Math.max(1, parseInt(searchParams.get('limit') || '200', 10)));
        const search = sanitizeSearchInput(searchParams.get('search') || '');
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');
        const skip = (page - 1) * limit;

        const whereClause: Prisma.PenumpangWhereInput = {};

        // Jika peran adalah 'USER', hanya tampilkan data yang mereka buat.
        if (user.role === 'USER') {
            whereClause.userId = user.id;
        }

        // Membuat klausa pencarian jika ada input.
        if (search && search.length >= 1) {
            whereClause.OR = [
                { nama: { contains: search, mode: 'insensitive' } },
                { tujuan: { contains: search, mode: 'insensitive' } },
                { nopol: { contains: search, mode: 'insensitive' } },
                { kapal: { contains: search, mode: 'insensitive' } },
                { jenisKendaraan: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Menambahkan filter rentang tanggal jika ada.
        if (startDateParam) {
            whereClause.tanggal = { ...whereClause.tanggal as Prisma.DateTimeFilter, gte: new Date(`${startDateParam}T00:00:00.000Z`) };
        }
        if (endDateParam) {
            whereClause.tanggal = { ...whereClause.tanggal as Prisma.DateTimeFilter, lte: new Date(`${endDateParam}T23:59:59.999Z`) };
        }

        // Menjalankan dua query (mengambil data dan menghitung total) dalam satu transaksi.
        // Dengan Prisma Accelerate, caching otomatis diterapkan untuk meningkatkan performa
        const [penumpang, total] = await prisma.$transaction([
            prisma.penumpang.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: { // Hanya memilih kolom yang diperlukan untuk optimasi
                    id: true,
                    nama: true,
                    usia: true,
                    jenisKelamin: true,
                    tujuan: true,
                    tanggal: true,
                    nopol: true,
                    jenisKendaraan: true,
                    golongan: true,
                    kapal: true,
                },
                // Contoh penggunaan caching dengan Accelerate
                // Uncomment baris di bawah untuk mengaktifkan caching
                // cacheStrategy: { ttl: 60, tags: ['penumpang', `user:${user.id}`] }
            }),
            prisma.penumpang.count({
                where: whereClause,
                // Caching untuk count query
                // cacheStrategy: { ttl: 60, tags: ['penumpang-count', `user:${user.id}`] }
            })
        ]);

        // Mengembalikan data beserta metadata paginasi.
        return NextResponse.json({
            data: penumpang,
            total,
            meta: { page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error: unknown) {
        console.error("GET Penumpang Error:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
