import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '200', 10);
        const search = searchParams.get('search') || '';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { nama: { contains: search, mode: 'insensitive' } },
                { tujuan: { contains: search, mode: 'insensitive' } },
                { nopol: { contains: search, mode: 'insensitive' } },
                { kapal: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (startDate) {
            where.tanggal = { ...where.tanggal, gte: new Date(startDate) };
        }

        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            where.tanggal = { ...where.tanggal, lte: endOfDay };
        }

        const [penumpang, total] = await prisma.$transaction([
            prisma.penumpang.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.penumpang.count({ where }),
        ]);

        return NextResponse.json({
            data: penumpang,
            total,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching penumpang' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            nama,
            usia,
            jenisKelamin,
            tujuan,
            tanggal,
            nopol,
            jenisKendaraan,
            golongan,
            kapal,
        } = body;

        const newPenumpang = await prisma.penumpang.create({
            data: {
                nama,
                usia,
                jenisKelamin,
                tujuan,
                tanggal,
                nopol,
                jenisKendaraan,
                golongan,
                kapal,
            },
        });

        return NextResponse.json(newPenumpang, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating penumpang' }, { status: 500 });
    }
}

