import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Fungsi untuk memverifikasi token dan mendapatkan payload
async function verifyToken(token: string) {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        console.error('JWT Verification Error:', error);
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get('token')?.value || '';

    const isPublicPath = path === '/login' || path === '/register';

    // Jika path adalah publik dan ada token, redirect ke dashboard
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
    }

    // Jika path bukan publik dan tidak ada token
    if (!isPublicPath && !token) {
        // Untuk API, kembalikan error 401
        if (path.startsWith('/api/')) {
            // Izinkan akses ke endpoint login/register
            if (path.startsWith('/api/auth/register') || path.startsWith('/api/auth/login')) {
                return NextResponse.next();
            }
            return new NextResponse(
                JSON.stringify({ message: 'Akses tidak diizinkan' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }
        // Untuk halaman lain, redirect ke login
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    // Jika ada token, verifikasi dan terapkan role-based access
    if (token) {
        const user = await verifyToken(token);

        if (!user) {
            // Jika token tidak valid, redirect ke login dan hapus cookie
            const response = NextResponse.redirect(new URL('/login', request.nextUrl));
            response.cookies.delete('token');
            return response;
        }

        const userRole = user.role as string;

        // Aturan untuk ADMIN
        if (userRole === 'ADMIN') {
            // Boleh akses semua halaman dashboard dan API terkait
            if (path.startsWith('/dashboard') || path.startsWith('/api/')) {
                return NextResponse.next();
            }
        }

        // Aturan untuk MANAGER
        if (userRole === 'MANAGER') {
            // Hanya boleh akses dashboard dan data penumpang
            if (path.startsWith('/dashboard/penumpang') || path === '/dashboard') {
                return NextResponse.next();
            }
            // Blokir akses ke halaman kelola pengguna
            if (path.startsWith('/dashboard/users')) {
                return NextResponse.redirect(new URL('/unauthorized', request.nextUrl));
            }
            // Blokir akses ke API pengguna
            if (path.startsWith('/api/users')) {
                return new NextResponse(
                    JSON.stringify({ message: 'Akses ditolak untuk peran MANAGER' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
            // Izinkan akses ke API lain yang relevan (misal: penumpang)
            if (path.startsWith('/api/')) {
                return NextResponse.next();
            }
        }

        // Aturan untuk USER (jika ada, defaultnya bisa ditambahkan di sini)
        // Contoh: User biasa hanya bisa lihat profilnya sendiri

    }

    // Jika tidak ada aturan yang cocok, lanjutkan request
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/register',
        '/api/:path*',
    ],
};