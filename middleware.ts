import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export default withAuth(
  // `withAuth` memperkaya `req.nextauth.token` dengan token JWT Anda
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Jika user sudah login, redirect dari halaman login/register ke dashboard
    if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Jika user adalah USER atau MANAGER, dan mencoba mengakses halaman atau API untuk users
    if (
      (token?.role === Role.USER || token?.role === Role.MANAGER) &&
      (pathname.startsWith('/dashboard/users') || pathname.startsWith('/api/users'))
    ) {
      // Untuk API, kembalikan response 403 Forbidden
      if (pathname.startsWith('/api')) {
        return new NextResponse(
          JSON.stringify({ message: `Akses ditolak untuk peran ${token.role}` }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Untuk halaman, redirect ke halaman dashboard utama
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Jika tidak ada aturan di atas yang cocok, lanjutkan seperti biasa
    return NextResponse.next();
  },
  {
    callbacks: {
      // Callback ini akan berjalan untuk semua path yang ada di `matcher`.
      // Jika `authorized` mengembalikan `false`, pengguna akan di-redirect ke halaman login.
      // Ini sudah benar untuk melindungi halaman dashboard.
      // Untuk halaman login/register, middleware akan tetap berjalan jika user sudah login (karena token ada),
      // dan logika redirect di atas akan dijalankan.
      authorized: ({ token }) => !!token,
    },
  }
);

// Tentukan path mana saja yang dilindungi oleh middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/penumpang/:path*',
    '/api/users/:path*',
    '/api/dashboard/:path*',
    '/login',
    '/register',
  ],
};
