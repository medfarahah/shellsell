import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/addresses?userId=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 },
    );
  }

  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(addresses);
  } catch (error) {
    console.error('GET /api/addresses error', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 },
    );
  }
}

// POST /api/addresses
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      email,
      userImage,
      street,
      city,
      state,
      zip,
      country,
      phone,
      whatsapp,
      quartier,
    } = body;

    if (!userId || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Ensure the user exists in the database (needed for the Address FK)
    try {
      await prisma.user.upsert({
        where: { id: userId },
        update: {
          name,
          email,
          image: userImage || '',
        },
        create: {
          id: userId,
          name,
          email,
          image: userImage || '',
        },
      });
    } catch (userError) {
      console.error('POST /api/addresses user upsert error', userError);
    }

    const address = await prisma.address.create({
      data: {
        userId,
        name,
        email,
        street,
        city,
        state,
        zip,
        country,
        phone,
        whatsapp,
        quartier,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('POST /api/addresses error', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 },
    );
  }
}

