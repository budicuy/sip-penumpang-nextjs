import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const penumpang = await prisma.penumpang.findUnique({
      where: {

        id: parseInt(id), // Ensure id is parsed as an integer
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      nama,
      usia,
      jenisKelamin,
      tujuan,
      tanggal,
      nopol,
      jenisKendaraan,
      golongan,
      kapal,
    } = body;

    const updatedPenumpang = await prisma.penumpang.update({
      where: {
        id: parseInt(id), // Ensure id is parsed as an integer
      },
      data: {
        nama,
        usia,
        jenisKelamin,
        tujuan,
        tanggal,
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.penumpang.delete({
      where: {
        id: parseInt(id), // Ensure id is parsed as an integer
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