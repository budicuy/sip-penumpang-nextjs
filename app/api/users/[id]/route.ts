import { PrismaClient, Role } from "@prisma/client";
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: Role;
  password?: string;
}

/**
 * Handler untuk metode GET. Mengambil detail satu pengguna berdasarkan ID.
 * Hanya admin yang diizinkan mengakses endpoint ini.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // 1. Cek sesi dan peran pengguna
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    const { id } = params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET User by ID Error:", error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pengguna' },
      { status: 500 },
    );
  }
}

/**
 * Handler untuk metode PUT. Memperbarui data pengguna berdasarkan ID.
 * Hanya admin yang diizinkan mengakses endpoint ini.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // 1. Cek sesi dan peran pengguna
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { name, email, password, role } = body;

    const dataToUpdate: UpdateUserData = { name, email, role };
    // 2. Jika ada password baru, hash password tersebut
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT User Error:", error);
    return NextResponse.json(
      { error: 'Gagal memperbarui pengguna' },
      { status: 500 },
    );
  }
}

/**
 * Handler untuk metode DELETE. Menghapus pengguna berdasarkan ID.
 * Hanya admin yang diizinkan mengakses endpoint ini.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // 1. Cek sesi dan peran pengguna
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    const { id } = params;

    // 2. Mencegah admin menghapus akunnya sendiri
    if (session.user.id === id) {
      return NextResponse.json({ error: 'Admin tidak dapat menghapus akunnya sendiri.' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Pengguna berhasil dihapus' },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE User Error:", error);
    return NextResponse.json(
      { error: 'Gagal menghapus pengguna' },
      { status: 500 },
    );
  }
}
