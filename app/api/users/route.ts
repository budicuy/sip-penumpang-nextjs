import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, Role } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

// GET all users with pagination and search
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';

  const skip = (page - 1) * limit;

  let where: Prisma.UserWhereInput = {};
  if (search) {
    const searchConditions: Prisma.UserWhereInput[] = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];

    const upperCaseSearch = search.toUpperCase();
    if (Object.values(Role).includes(upperCaseSearch as Role)) {
      searchConditions.push({ role: { equals: upperCaseSearch as Role } });
    }

    where = {
      OR: searchConditions,
    };
  }

  try {
    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}

// CREATE a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role: userRole } = body;

    if (!name || !email || !password || !userRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole as Role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}
