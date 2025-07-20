
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const tokenData = {
      id: user.id,
      email: user.email
    }

    const token = jwt.sign(tokenData, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '1h',
    });

    const response = NextResponse.json({
      message: "Login successful",
      success: true,
    })

    response.cookies.set("token", token, {
      httpOnly: true,
    })

    return response;

  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan yang tidak diketahui' }, { status: 500 });
  }
}
