import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, Prisma, Penumpang } from '@prisma/client';
import { getUser } from '../../utils/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const user = await getUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Otentikasi gagal' }, { status: 401 });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);


        const whereClause: Prisma.PenumpangWhereInput = {};
        if (user.role === 'USER') {
            whereClause.userId = user.id;
        }

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
            take: 5,
            orderBy: { createdAt: 'desc' },
        });

        const userCountPromise = user.role === 'ADMIN' ? prisma.user.count() : Promise.resolve(undefined);

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

        if (totalPengguna !== undefined) {
            response.totalPengguna = totalPengguna;
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data dasbor' }, { status: 500 });
    }
}
