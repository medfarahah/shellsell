import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/ratings?productId=&userId=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const userId = searchParams.get('userId');

  const where = {};
  if (productId) where.productId = productId;
  if (userId) where.userId = userId;

  try {
    const ratings = await prisma.rating.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(ratings);
  } catch (error) {
    console.error('GET /api/ratings error', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 },
    );
  }
}

// POST /api/ratings
export async function POST(request) {
  try {
    const body = await request.json();
    const { rating, review, userId, productId, orderId } = body;

    if (!rating || !review || !userId || !productId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const createdRating = await prisma.rating.create({
      data: {
        rating,
        review,
        userId,
        productId,
        orderId,
      },
    });

    return NextResponse.json(createdRating, { status: 201 });
  } catch (error) {
    console.error('POST /api/ratings error', error);
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 },
    );
  }
}

