import { NextResponse } from 'next/server';
import { PrismaClient, Prisma, role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// GET a single user by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error(`Error fetching user:`, error);
    return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
  }
}

// UPDATE a user by ID
export async function PUT(request: Request, { params }: { params: Promise<{ id:string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, password, role: userRole } = body;

    const dataToUpdate: Prisma.UserUpdateInput = { name, email, role: userRole as role };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Error updating user:`, error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}

// DELETE a user by ID
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting user:`, error);
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
  }
}