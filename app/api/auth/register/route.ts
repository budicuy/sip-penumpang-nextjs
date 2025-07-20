import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@/app/generated/prisma';
import { z } from 'zod';
import { Prisma } from '@/app/generated/prisma';

const prisma = new PrismaClient();

const userSchema = z.object({
  name: z.string().min(3, { message: "Nama harus memiliki setidaknya 3 karakter" }),
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(8, { message: "Password harus memiliki setidaknya 8 karakter" }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = userSchema.safeParse(body);

    if (!validation.success) {
      // ✅ INI BAGIAN YANG DIPERBAIKI
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password } = validation.data;
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    };

    return NextResponse.json({
      message: 'Pendaftaran berhasil',
      user: userResponse
    }, { status: 201 });

  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Email ini sudah terdaftar.' }, { status: 409 });
      }
    }

    console.error('Registration API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}