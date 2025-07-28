import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function untuk validasi dan sanitasi input
function sanitizeSearchInput(search: string): string {
    if (!search) return '';
    // Sanitasi dasar untuk mencegah XSS sederhana
    return search.trim().replace(/[<>"']/g, '').substring(0, 100);
}

export async function GET(request: Request) {
    const startTime = Date.now();

    try {
        const { searchParams } = new URL(request.url);

        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(10000, Math.max(1, parseInt(searchParams.get('limit') || '200', 10)));
        const search = sanitizeSearchInput(searchParams.get('search') || '');
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        const skip = (page - 1) * limit;

        const whereClause: Prisma.PenumpangWhereInput = {};

        if (search && search.length >= 1) {
            whereClause.OR = [
                { nama: { contains: search, mode: 'insensitive' } },
                { tujuan: { contains: search, mode: 'insensitive' } },
                { nopol: { contains: search, mode: 'insensitive' } },
                { kapal: { contains: search, mode: 'insensitive' } },
                { jenisKendaraan: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Filter tanggal yang aman dari zona waktu (menggunakan UTC)
        if (startDateParam) {
            whereClause.tanggal = {
                ...whereClause.tanggal as Prisma.DateTimeFilter,
                gte: new Date(`${startDateParam}T00:00:00.000Z`) // Awal hari di UTC
            };
        }
        if (endDateParam) {
            whereClause.tanggal = {
                ...whereClause.tanggal as Prisma.DateTimeFilter,
                lte: new Date(`${endDateParam}T23:59:59.999Z`) // Akhir hari di UTC
            };
        }

        const [penumpang, total] = await prisma.$transaction([
            prisma.penumpang.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { tanggal: 'desc' }, // Urutkan berdasarkan tanggal penumpang
                select: {
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
                }
            }),
            prisma.penumpang.count({ where: whereClause })
        ]);

        console.log(`Found ${penumpang.length}/${total} records in ${Date.now() - startTime}ms`);

        return NextResponse.json({
            data: penumpang,
            total,
            meta: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });

    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const requiredFields = ['nama', 'usia', 'jenisKelamin', 'tujuan', 'tanggal', 'nopol', 'jenisKendaraan', 'golongan', 'kapal'];
        if (requiredFields.some(field => !body[field])) {
            return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
        }

        // Validasi format tanggal (ISO 8601)
        if (isNaN(Date.parse(body.tanggal))) {
            return NextResponse.json({ error: 'Format tanggal tidak valid' }, { status: 400 });
        }

        const newPenumpang = await prisma.penumpang.create({
            data: {
                nama: body.nama,
                usia: body.usia,
                jenisKelamin: body.jenisKelamin,
                tujuan: body.tujuan,
                tanggal: body.tanggal, // Langsung gunakan ISO string dari body
                nopol: body.nopol,
                jenisKendaraan: body.jenisKendaraan,
                golongan: body.golongan,
                kapal: body.kapal,
            },
        });

        return NextResponse.json(newPenumpang, { status: 201 });

    } catch (error: unknown) {
        console.error('POST Error:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: 'Data duplikat terdeteksi' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Gagal membuat data penumpang' }, { status: 500 });
    }
}
