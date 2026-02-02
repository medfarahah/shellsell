import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/users?id=&email=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const email = searchParams.get('email');

  if (!id && !email) {
    return NextResponse.json(
      { error: 'id or email is required' },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        ...(id ? { id } : {}),
        ...(email ? { email } : {}),
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('GET /api/users error', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 },
    );
  }
}

// POST /api/users - upsert style create/update with cart JSON
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, email, image, cart } = body;

    if (!id || !name || !email || !image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        name,
        email,
        image,
        ...(cart !== undefined ? { cart } : {}),
      },
      create: {
        id,
        name,
        email,
        image,
        ...(cart !== undefined ? { cart } : {}),
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error', error);
    return NextResponse.json(
      { error: 'Failed to create or update user' },
      { status: 500 },
    );
  }
}

