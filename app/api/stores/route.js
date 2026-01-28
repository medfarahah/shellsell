import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/stores?userId=...&status=... - list stores (filtered by userId/status if provided, otherwise all active stores)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    const status = searchParams.get('status');

    const where = {};
    if (userId) {
      where.userId = userId;
    } else if (username) {
      where.username = username;
      where.isActive = true;
    } else if (status === 'all') {
      // Return all stores (no filter) for admin
      // where is empty, so all stores are returned
    } else if (status) {
      where.status = status;
    } else {
      where.isActive = true;
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
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

    // Validate required fields
    const missingFields = [];
    if (!userId) missingFields.push('userId');
    if (!name) missingFields.push('name');
    if (!description) missingFields.push('description');
    if (!username) missingFields.push('username');
    if (!address) missingFields.push('address');
    if (!logo) missingFields.push('logo');
    if (!email) missingFields.push('email');
    if (!contact) missingFields.push('contact');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 },
      );
    }

    // Ensure User exists in database (create if doesn't exist)
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Create user if doesn't exist (from Clerk)
      user = await prisma.user.create({
        data: {
          id: userId,
          name: '',
          email: email,
          image: '',
        },
      });
    }

    // Check if user already has a store
    const existingStore = await prisma.store.findUnique({
      where: { userId },
    });

    if (existingStore) {
      return NextResponse.json(
        { error: 'User already has a store' },
        { status: 400 },
      );
    }

    // Check if username is already taken
    const usernameTaken = await prisma.store.findUnique({
      where: { username },
    });

    if (usernameTaken) {
      return NextResponse.json(
        { error: 'Username already taken' },
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
        status: 'pending', // New stores start as pending
        isActive: false, // Not active until approved
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('POST /api/stores error', error);
    
    // Return more specific error messages
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 },
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create store' },
      { status: 500 },
    );
  }
}

