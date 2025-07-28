import { PrismaClient, Role } from "@prisma/client";
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/auth";
import argon2 from 'argon2';

const prisma = new PrismaClient();

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: Role;
  password?: string;
}

// Helper untuk ambil id dari URL dinamis
function getIdFromRequest(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split('/');
  return segments[segments.length - 1] || null;
}

/**
 * GET /api/users/[id]
 * Hanya admin yang boleh mengakses
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const id = getIdFromRequest(request);
  if (!id) {
    return NextResponse.json({ error: 'ID tidak ditemukan di URL' }, { status: 400 });
  }

  try {
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
 * PUT /api/users/[id]
 * Admin bisa update user lain
 */
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const id = getIdFromRequest(request);
  if (!id) {
    return NextResponse.json({ error: 'ID tidak ditemukan di URL' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    const dataToUpdate: UpdateUserData = { name, email, role };

    if (password) {
      dataToUpdate.password = await argon2.hash(password, { type: argon2.argon2id });
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
 * DELETE /api/users/[id]
 * Admin bisa menghapus user lain, tapi bukan dirinya sendiri
 */
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const id = getIdFromRequest(request);
  if (!id) {
    return NextResponse.json({ error: 'ID tidak ditemukan di URL' }, { status: 400 });
  }

  if (session.user.id === id) {
    return NextResponse.json({ error: 'Admin tidak dapat menghapus akunnya sendiri.' }, { status: 400 });
  }

  try {
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
