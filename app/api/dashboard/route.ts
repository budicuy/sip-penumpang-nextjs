import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
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

        let whereClause: any = {};
        if (user.role === 'USER') {
            whereClause.userId = user.id;
        }

        const totalPenumpang = prisma.penumpang.count({ where: whereClause });
        const todayPenumpang = prisma.penumpang.count({
            where: {
                ...whereClause,
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        const latestPenumpang = prisma.penumpang.findMany({
            where: whereClause,
            take: 5,
            orderBy: { createdAt: 'desc' },
        });

        const queries = [totalPenumpang, todayPenumpang, latestPenumpang];
        if (user.role === 'ADMIN') {
            queries.push(prisma.user.count());
        }

        const [total, todayCount, latest, userCount] = await Promise.all(queries);

        const response: any = {
            totalPenumpang: total,
            penumpangHariIni: todayCount,
            penumpangTerbaru: latest,
        };

        if (user.role === 'ADMIN') {
            response.totalPengguna = userCount;
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data dasbor' }, { status: 500 });
    }
}
