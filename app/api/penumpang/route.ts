import { PrismaClient } from '@/app/generated/prisma';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const penumpang = await prisma.penumpang.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json(penumpang);
    } catch {
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

