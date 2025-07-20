import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@/app/generated/prisma'; // Pastikan path ini benar

const prisma = new PrismaClient();
const JWT_EXPIRATION_TIME = '1h'; // Durasi token: 1 jam
const COOKIE_MAX_AGE = 60 * 60;   // Durasi cookie dalam detik: 1 jam

export async function POST(request: Request) {
  try {
    // 1. Validasi Input Sederhana
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email dan password dibutuhkan' }, { status: 400 });
    }

    // 2. Cari User di Database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Pesan error generik untuk mencegah user enumeration
      return NextResponse.json({ error: 'Kombinasi email dan password salah' }, { status: 401 });
    }

    // 3. Bandingkan Password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Pesan error generik yang sama
      return NextResponse.json({ error: 'Kombinasi email dan password salah' }, { status: 401 });
    }

    // 4. Pastikan JWT Secret Ada (Sangat Penting!)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("FATAL ERROR: JWT_SECRET tidak diatur.");
      throw new Error("Konfigurasi server tidak lengkap."); // Ini akan ditangkap oleh blok catch
    }

    // 5. Buat Payload dan Token JWT
    const tokenData = {
      id: user.id,
      // Sebaiknya hanya sertakan data non-sensitif dan yang dibutuhkan. ID biasanya cukup.
    };

    const token = jwt.sign(tokenData, jwtSecret, {
      expiresIn: JWT_EXPIRATION_TIME,
    });

    // 6. Buat Respons dan Atur Cookie dengan Aman
    const response = NextResponse.json({
      message: "Login berhasil",
      success: true,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });

    return response;

  } catch (error: unknown) {
    // 7. Penanganan Error yang Aman
    console.error('Login API Error:', error); // Log error asli untuk developer
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}