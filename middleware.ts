import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/login' || path === '/register'

  const token = request.cookies.get('token')?.value || ''

  if(isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  if (!isPublicPath && !token) {
    if (path.startsWith('/api/')) {
      if (path.startsWith('/api/auth/register') || path.startsWith('/api/auth/login')) {
        return NextResponse.next();
      }
      return new NextResponse(
        JSON.stringify({ message: 'Akses tidak diizinkan' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }
    
}
 
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/api/:path*'
  ],
}