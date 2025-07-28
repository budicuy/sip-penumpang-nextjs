import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from 'next/server';
import { getUser } from "../../../utils/auth";

const prisma = new PrismaClient();

async function checkOwnership(userId: string, userRole: string, penumpangId: number) {
  const penumpang = await prisma.penumpang.findUnique({
    where: { id: penumpangId },
  });

  if (!penumpang) {
    return { error: 'Penumpang not found', status: 404 };
  }

  if (userRole === 'USER' && penumpang.userId !== userId) {
    return { error: 'Akses ditolak', status: 403 };
  }

  return { penumpang };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Otentikasi gagal' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { penumpang, error, status } = await checkOwnership(user.id, user.role, parseInt(id));
    if (error) {
      return NextResponse.json({ error }, { status });
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
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Otentikasi gagal' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { error, status } = await checkOwnership(user.id, user.role, parseInt(id));
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const body = await request.json();
    const updatedPenumpang = await prisma.penumpang.update({
      where: {
        id: parseInt(id),
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
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Otentikasi gagal' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { error, status } = await checkOwnership(user.id, user.role, parseInt(id));
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    await prisma.penumpang.delete({
      where: {
        id: parseInt(id),
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