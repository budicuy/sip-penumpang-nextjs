import { PrismaClient } from '@/app/generated/prisma';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const penumpang = await prisma.penumpang.findUnique({
      where: {
        id,
      },
    });

    if (!penumpang) {
      return NextResponse.json({ error: 'Penumpang not found' }, { status: 404 });
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
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      nama,
      usia,
      jenisKelamin,
      tujuan,
      tanggal,
      jam,
      nopol,
      jenisKendaraan,
      golongan,
      kapal,
    } = body;

    const updatedPenumpang = await prisma.penumpang.update({
      where: {
        id,
      },
      data: {
        nama,
        usia,
        jenisKelamin,
        tujuan,
        tanggal,
        jam,
        nopol,
        jenisKendaraan,
        golongan,
        kapal,
      },
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
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    await prisma.penumpang.delete({
      where: {
        id,
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
