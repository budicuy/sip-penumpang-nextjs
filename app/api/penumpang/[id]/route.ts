import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from 'next/server';
import { getUser } from "../../../utils/auth";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Otentikasi gagal' }, { status: 401 });
  }

  try {
    const penumpang = await prisma.penumpang.findUnique({
      where: {
        id: parseInt(params.id),
      },
    });

    if (!penumpang) {
      return NextResponse.json({ error: 'Penumpang not found' }, { status: 404 });
    }

    // Periksa kepemilikan jika user adalah USER biasa
    if (user.role === 'USER' && penumpang.userId !== user.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    return NextResponse.json(penumpang);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error fetching penumpang' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Otentikasi gagal' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const penumpang = await prisma.penumpang.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!penumpang) {
      return NextResponse.json({ error: 'Penumpang not found' }, { status: 404 });
    }

    if (user.role === 'USER' && penumpang.userId !== user.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const updatedPenumpang = await prisma.penumpang.update({
      where: {
        id: parseInt(params.id),
      },
      data: body,
    });

    return NextResponse.json(updatedPenumpang);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error updating penumpang' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Otentikasi gagal' }, { status: 401 });
  }

  try {
    const penumpang = await prisma.penumpang.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!penumpang) {
      return NextResponse.json({ error: 'Penumpang not found' }, { status: 404 });
    }

    if (user.role === 'USER' && penumpang.userId !== user.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    await prisma.penumpang.delete({
      where: {
        id: parseInt(params.id),
      },
    });

    return NextResponse.json(
      { message: 'Penumpang deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error deleting penumpang' },
      { status: 500 },
    );
  }
}
