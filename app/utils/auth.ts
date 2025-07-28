import { PrismaClient, Role } from "@prisma/client";
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const prisma = new PrismaClient();

// Definisikan tipe untuk parameter konteks yang diterima oleh route handler dinamis.
type RouteContext = {
    params: {
        id: string;
    };
};

/**
 * Fungsi bantuan untuk memeriksa otentikasi dan otorisasi pengguna.
 * Memastikan pengguna sudah login dan memiliki hak akses yang sesuai
 * terhadap data penumpang yang diminta.
 * @param session Objek sesi pengguna dari NextAuth.
 * @param penumpangId ID dari data penumpang yang akan diakses.
 * @returns Objek berisi data penumpang jika otorisasi berhasil, atau objek error jika gagal.
 */
async function checkAuthorization(
    session: Session | null,
    penumpangId: number
) {
    // Jika tidak ada sesi atau pengguna, otentikasi gagal.
    if (!session?.user) {
        return { error: NextResponse.json({ error: 'Otentikasi gagal' }, { status: 401 }) };
    }

    // Cari data penumpang di database.
    const penumpang = await prisma.penumpang.findUnique({
        where: { id: penumpangId },
    });

    // Jika data tidak ditemukan, kembalikan error 404.
    if (!penumpang) {
        return { error: NextResponse.json({ error: 'Data penumpang tidak ditemukan' }, { status: 404 }) };
    }

    const user = session.user;

    // Logika Otorisasi:
    // - ADMIN dan MANAGER boleh mengakses semua data.
    // - USER hanya boleh mengakses data yang mereka buat sendiri (userId cocok).
    if (
        user.role !== Role.ADMIN &&
        user.role !== Role.MANAGER &&
        penumpang.userId !== user.id
    ) {
        return { error: NextResponse.json({ error: 'Akses ditolak' }, { status: 403 }) };
    }

    // Jika semua pengecekan berhasil, kembalikan data penumpang.
    return { penumpang };
}

/**
 * Handler untuk metode GET: Mengambil detail satu data penumpang.
 */
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    const { params } = context;
    const session = await getServerSession(authOptions);
    const penumpangId = parseInt(params.id, 10);

    // Validasi ID untuk memastikan itu adalah angka.
    if (isNaN(penumpangId)) {
        return NextResponse.json({ error: 'ID Penumpang tidak valid' }, { status: 400 });
    }

    const { penumpang, error } = await checkAuthorization(session, penumpangId);
    if (error) return error;

    return NextResponse.json(penumpang);
}

/**
 * Handler untuk metode PUT: Memperbarui satu data penumpang.
 */
export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
    const { params } = context;
    const session = await getServerSession(authOptions);
    const penumpangId = parseInt(params.id, 10);

    if (isNaN(penumpangId)) {
        return NextResponse.json({ error: 'ID Penumpang tidak valid' }, { status: 400 });
    }

    // Cek otorisasi sebelum melanjutkan.
    const { error } = await checkAuthorization(session, penumpangId);
    if (error) return error;

    try {
        const body = await request.json();
        const updatedPenumpang = await prisma.penumpang.update({
            where: { id: penumpangId },
            data: body,
        });

        return NextResponse.json(updatedPenumpang);
    } catch (err) {
        console.error("PUT Penumpang Error:", err);
        return NextResponse.json(
            { error: 'Gagal memperbarui data penumpang' },
            { status: 500 },
        );
    }
}

/**
 * Handler untuk metode DELETE: Menghapus satu data penumpang.
 */
export async function DELETE(
    request: NextRequest,
    context: RouteContext
) {
    const { params } = context;
    const session = await getServerSession(authOptions);
    const penumpangId = parseInt(params.id, 10);

    if (isNaN(penumpangId)) {
        return NextResponse.json({ error: 'ID Penumpang tidak valid' }, { status: 400 });
    }

    // Cek otorisasi sebelum melanjutkan.
    const { error } = await checkAuthorization(session, penumpangId);
    if (error) return error;

    try {
        await prisma.penumpang.delete({
            where: { id: penumpangId },
        });

        return NextResponse.json(
            { message: 'Data penumpang berhasil dihapus' },
            { status: 200 },
        );
    } catch (err) {
        console.error("DELETE Penumpang Error:", err);
        return NextResponse.json(
            { error: 'Gagal menghapus data penumpang' },
            { status: 500 },
        );
    }
}
