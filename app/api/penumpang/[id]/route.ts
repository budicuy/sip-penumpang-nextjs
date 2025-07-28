import { PrismaClient, Role } from "@prisma/client";
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const prisma = new PrismaClient();

/**
 * Helper function untuk memeriksa otentikasi dan kepemilikan data.
 */
async function checkAuthorization(
  session: Session | null,
  penumpangId: number
) {
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Otentikasi gagal' }, { status: 401 }) };
  }

  const penumpang = await prisma.penumpang.findUnique({
    where: { id: penumpangId },
  });

  if (!penumpang) {
    return { error: NextResponse.json({ error: 'Data penumpang tidak ditemukan' }, { status: 404 }) };
  }

  const user = session.user;

  if (
    user.role !== Role.ADMIN &&
    user.role !== Role.MANAGER &&
    penumpang.userId !== user.id
  ) {
    return { error: NextResponse.json({ error: 'Akses ditolak' }, { status: 403 }) };
  }

  return { penumpang };
}

/**
 * Handler untuk metode GET. Mengambil detail satu data penumpang.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const idParam = request.nextUrl.pathname.split('/').pop();
  const penumpangId = parseInt(idParam || '', 10);

  if (isNaN(penumpangId)) {
    return NextResponse.json({ error: 'ID Penumpang tidak valid' }, { status: 400 });
  }

  const { penumpang, error } = await checkAuthorization(session, penumpangId);
  if (error) return error;

  return NextResponse.json(penumpang);
}

