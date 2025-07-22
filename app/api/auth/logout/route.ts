import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = NextResponse.json({
            message: "Logout berhasil",
            success: true,
        });

        // Hapus cookie dengan menyamakan semua atribut penting
        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            // Set expires ke masa lalu untuk menghapusnya
            expires: new Date(0)
        });

        return response;

    } catch (error: unknown) {
        // Log error asli untuk developer
        console.error('Logout API Error:', error);

        // Kirim pesan generik ke client
        return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
    }
}