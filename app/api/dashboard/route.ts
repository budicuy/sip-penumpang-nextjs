import { NextResponse } from 'next/server';
import { PrismaClient, Prisma, Penumpang, Role } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/auth';
import { withAccelerate } from '@prisma/extension-accelerate';
import swr from "swr";

const prisma = new PrismaClient().$extends(withAccelerate());

/**
 * Handler untuk metode GET. Mengambil data statistik untuk halaman dashboard.
 * Data yang diambil disesuaikan berdasarkan peran pengguna yang login.
 */
export async function GET() {
    // 1. Mengambil sesi pengguna dari sisi server menggunakan NextAuth.js
    const session = await getServerSession(authOptions);

    // 2. Jika tidak ada sesi, berarti pengguna belum login. Kembalikan error 401.
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Otentikasi gagal' }, { status: 401 });
    }
    // Mendefinisikan tipe user dari sesi agar TypeScript mengenali properti id dan role
    const user = session.user as { id: string; role: Role };

    try {
        // Menentukan rentang waktu untuk "hari ini"
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Membuat klausa 'where' dasar untuk query Prisma
        const whereClause: Prisma.PenumpangWhereInput = {};

        // 3. Logika Otorisasi: Jika pengguna adalah 'USER', filter data penumpang hanya
        //    untuk data yang mereka buat sendiri. ADMIN dan MANAGER bisa melihat semua.
        if (user.role === 'USER') {
            whereClause.userId = user.id;
        }

        // Menyiapkan semua query database untuk dijalankan secara paralel
        const totalPenumpangPromise = prisma.penumpang.count({ where: whereClause });

        const todayPenumpangPromise = prisma.penumpang.count({
            where: {
                ...whereClause,
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },

            },
        });

        const latestPenumpangPromise = prisma.penumpang.findMany({
            where: whereClause,
            cacheStrategy: {
                ttl: 60, // Cache selama 60 detik
                swr: 60,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
        });

        // Query untuk menghitung total pengguna hanya dijalankan jika yang login adalah ADMIN
        const userCountPromise = user.role === 'ADMIN'
            ? prisma.user.count()
            : Promise.resolve(undefined);

        // 4. Menjalankan semua query secara bersamaan untuk efisiensi
        const [
            totalPenumpang,
            todayPenumpang,
            latestPenumpang,
            totalPengguna
        ] = await Promise.all([
            totalPenumpangPromise,
            todayPenumpangPromise,
            latestPenumpangPromise,
            userCountPromise
        ]);

        // Membangun objek respons
        const response: {
            totalPenumpang: number;
            penumpangHariIni: number;
            penumpangTerbaru: Penumpang[];
            totalPengguna?: number;
        } = {
            totalPenumpang,
            penumpangHariIni: todayPenumpang,
            penumpangTerbaru: latestPenumpang,
        };

        // Menambahkan totalPengguna ke respons hanya jika datanya ada (untuk ADMIN)
        if (totalPengguna !== undefined) {
            response.totalPengguna = totalPengguna;
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data dasbor' }, { status: 500 });
    }
}
