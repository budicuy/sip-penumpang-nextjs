import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from 'next/server';
import { getUser } from "../../../utils/auth";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// GET a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Otentikasi gagal' }, { status: 401 });
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
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pengguna' },
      { status: 500 },
    );
  }
}

// UPDATE a user - DISABLED
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getUser(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { name, email, password, role } = body;

    const dataToUpdate: any = { name, email, role };
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
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal memperbarui pengguna' },
      { status: 500 },
    );
  }
}

// DELETE a user - DISABLED
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getUser(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    const { id } = params;

    // Optional: Add a check to prevent admin from deleting themselves
    if (session.id === id) {
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
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal menghapus pengguna' },
      { status: 500 },
    );
  }
}
