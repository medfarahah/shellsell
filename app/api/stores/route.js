import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/stores - list all active stores
export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(stores);
  } catch (error) {
    console.error('GET /api/stores error', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 },
    );
  }
}

// POST /api/stores - create a store (seller onboarding)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      description,
      username,
      address,
      logo,
      email,
      contact,
    } = body;

    if (!userId || !name || !description || !username || !address || !logo || !email || !contact) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const store = await prisma.store.create({
      data: {
        userId,
        name,
        description,
        username,
        address,
        logo,
        email,
        contact,
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('POST /api/stores error', error);
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 },
    );
  }
}

