import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(token, secret);
        // Return non-sensitive user data
        return NextResponse.json({ id: payload.id, role: payload.role });
    } catch (error) {
        console.error('Session API - JWT Verification Error:', error);
        // Clear the invalid cookie if verification fails
        const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        response.cookies.delete('token');
        return response;
    }
}
