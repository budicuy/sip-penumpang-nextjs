import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export interface UserPayload {
    id: string;
    role: string;
}

export async function getUser(request: NextRequest): Promise<UserPayload | null> {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as UserPayload;
    } catch (e) {
        console.error('Token verification failed:', e);
        return null;
    }
}
