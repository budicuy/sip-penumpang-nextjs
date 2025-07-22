import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function untuk validasi dan sanitasi input
function sanitizeSearchInput(search: string): string {
    if (!search) return '';
    return search.trim().replace(/[<>\"']/g, '').substring(0, 100);
}

function validateDateInput(dateString: string): Date | null {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        const now = new Date();
        const minDate = new Date(now.getFullYear() - 10, 0, 1);
        const maxDate = new Date(now.getFullYear() + 1, 11, 31);
        if (date < minDate || date > maxDate) return null;
        return date;
    } catch {
        return null;
    }
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

        console.log('API Request:', { page, limit, search, startDateParam, endDateParam });

        const skip = (page - 1) * limit;

        // Build where clause with proper Prisma types
        const whereClause: Prisma.PenumpangWhereInput = {};

        // Search filter
        if (search && search.length >= 1) {
            whereClause.OR = [
                { nama: { contains: search } },
                { tujuan: { contains: search } },
                { nopol: { contains: search } },
                { kapal: { contains: search } },
                { jenisKendaraan: { contains: search } },
            ];
        }

        // Date filter
        if (startDateParam || endDateParam) {
            const dateFilter: Prisma.DateTimeFilter = {};

            if (startDateParam) {
                const startDate = validateDateInput(startDateParam);
                if (startDate) {
                    startDate.setHours(0, 0, 0, 0);
                    dateFilter.gte = startDate;
                }
            }

            if (endDateParam) {
                const endDate = validateDateInput(endDateParam);
                if (endDate) {
                    endDate.setHours(23, 59, 59, 999);
                    dateFilter.lte = endDate;
                }
            }

            if (Object.keys(dateFilter).length > 0) {
                whereClause.tanggal = dateFilter;
            }
        }

        try {
            // Execute separate queries instead of transaction
            const penumpang = await prisma.penumpang.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
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
                    createdAt: true,
                }
            });

            const total = await prisma.penumpang.count({
                where: whereClause
            });

            console.log(`Found ${penumpang.length}/${total} records in ${Date.now() - startTime}ms`);

            // Validate and format response data
            const formattedData = penumpang.map(p => ({
                id: p.id,
                nama: p.nama || '',
                usia: Number(p.usia) || 0,
                jenisKelamin: p.jenisKelamin || 'L',
                tujuan: p.tujuan || '',
                tanggal: p.tanggal ? p.tanggal.toISOString() : new Date().toISOString(),
                nopol: p.nopol || '',
                jenisKendaraan: p.jenisKendaraan || '',
                golongan: p.golongan || 'I',
                kapal: p.kapal || '',
            }));

            return NextResponse.json({
                data: formattedData,
                total,
                meta: {
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1,
                }
            });

        } catch (dbError: unknown) {
            console.error('Database error:', dbError);

            // Type guard untuk Prisma error
            if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
                if (dbError.code === 'P2024') {
                    return NextResponse.json({
                        error: 'Database timeout. Please try again.',
                        code: 'TIMEOUT'
                    }, { status: 504 });
                }

                if (dbError.code?.startsWith('P2')) {
                    return NextResponse.json({
                        error: 'Database query error. Please check your filters.',
                        code: 'QUERY_ERROR'
                    }, { status: 400 });
                }
            }

            return NextResponse.json({
                error: 'Database connection error.',
                code: 'DB_ERROR'
            }, { status: 503 });
        }

    } catch (error: unknown) {
        console.error('API Error:', error);

        if (error instanceof Error && error.name === 'SyntaxError') {
            return NextResponse.json({
                error: 'Invalid request format',
                code: 'SYNTAX_ERROR'
            }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = ['nama', 'usia', 'jenisKelamin', 'tujuan', 'tanggal', 'nopol', 'jenisKendaraan', 'golongan', 'kapal'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json({
                error: `Missing required fields: ${missingFields.join(', ')}`,
                code: 'VALIDATION_ERROR'
            }, { status: 400 });
        }

        // Sanitize and validate data
        const sanitizedData: Prisma.PenumpangCreateInput = {
            nama: String(body.nama).trim().substring(0, 100),
            usia: Math.max(1, Math.min(150, Number(body.usia))),
            jenisKelamin: ['L', 'P'].includes(body.jenisKelamin) ? body.jenisKelamin : 'L',
            tujuan: String(body.tujuan).trim().substring(0, 50),
            tanggal: validateDateInput(body.tanggal) || new Date(),
            nopol: String(body.nopol).trim().toUpperCase().substring(0, 12),
            jenisKendaraan: String(body.jenisKendaraan).trim().substring(0, 50),
            golongan: ['I', 'II', 'III', 'IVa', 'IVb', 'V', 'VI', 'VII', 'VIII', 'IX'].includes(body.golongan) ? body.golongan : 'I',
            kapal: String(body.kapal).trim().substring(0, 50),
        };

        const newPenumpang = await prisma.penumpang.create({
            data: sanitizedData,
        });

        return NextResponse.json(newPenumpang, { status: 201 });

    } catch (error: unknown) {
        console.error('POST Error:', error);

        // Type guard untuk Prisma error
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json({
                    error: 'Data already exists',
                    code: 'DUPLICATE_ERROR'
                }, { status: 409 });
            }

            if (error.code?.startsWith('P2')) {
                return NextResponse.json({
                    error: 'Database constraint error',
                    code: 'CONSTRAINT_ERROR'
                }, { status: 400 });
            }
        }

        return NextResponse.json({
            error: 'Error creating penumpang',
            code: 'CREATE_ERROR'
        }, { status: 500 });
    }
}
