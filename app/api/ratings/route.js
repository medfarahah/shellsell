import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/ratings?productId=&userId=&storeId=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const userId = searchParams.get('userId');
  const storeId = searchParams.get('storeId');

  const where = {};
  if (productId) where.productId = productId;
  if (userId) where.userId = userId;
  if (storeId) {
    // Filter ratings by products that belong to the store
    where.product = {
      storeId: storeId,
    };
  }

  try {
    const ratings = await prisma.rating.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            images: true,
          },
        },
      },
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
      include: {
        product: {
          include: {
            store: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    // --- Notification Logic (Inngest) ---
    try {
      const { inngest } = await import('@/src/inngest/client');
      await inngest.send({
        name: "shop/review.submitted",
        data: {
          orderId,
          reviewId: createdRating.id,
          rating,
          reviewText: review,
          productName: createdRating.product.name,
          sellerEmail: createdRating.product.store?.user?.email
        },
      });
    } catch (notifyError) {
      console.error('Failed to trigger Inngest event:', notifyError);
    }
    // ------------------------------------

    return NextResponse.json(createdRating, { status: 201 });
  } catch (error) {
    console.error('POST /api/ratings error', error);
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 },
    );
  }
}

