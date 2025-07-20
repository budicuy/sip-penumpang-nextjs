
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Dalam aplikasi nyata, validasi input di sini

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'Pendaftaran berhasil', user }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan yang tidak diketahui' }, { status: 500 });

  }
}
