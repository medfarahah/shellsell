import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/orders?userId=&storeId=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const storeId = searchParams.get('storeId');

  const where = {};
  if (userId) where.userId = userId;
  if (storeId) where.storeId = storeId;

  try {
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
        user: true,
        store: true,
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET /api/orders error', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
}

// POST /api/orders - create order with nested items
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      total,
      userId,
      storeId,
      addressId,
      isPaid,
      paymentMethod,
      isCouponUsed = false,
      coupon = {},
      orderItems,
    } = body;

    if (
      !total ||
      !userId ||
      !storeId ||
      !addressId ||
      typeof isPaid !== 'boolean' ||
      !paymentMethod ||
      !Array.isArray(orderItems) ||
      orderItems.length === 0
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const order = await prisma.order.create({
      data: {
        total: Number(total), // Coerce to Float
        userId,
        storeId,
        addressId,
        isPaid: Boolean(isPaid), // Coerce to Boolean
        paymentMethod,
        isCouponUsed: Boolean(isCouponUsed), // Coerce to Boolean
        coupon: coupon || {},
        orderItems: {
          create: orderItems.map((item) => {
            const orderItemData = {
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            };
            // Only include selectedColor/selectedSize if they have values
            if (item.selectedColor && item.selectedColor.trim()) {
              orderItemData.selectedColor = item.selectedColor.trim();
            }
            if (item.selectedSize && item.selectedSize.trim()) {
              orderItemData.selectedSize = item.selectedSize.trim();
            }
            return orderItemData;
          }),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // --- Notification Logic (Inngest) ---
    try {
      // Send event to Inngest to handle notification in background
      const { inngest } = await import('@/src/inngest/client');
      await inngest.send({
        name: "notification/order.created",
        data: {
          orderId: order.id,
          storeId: storeId,
        },
      });
    } catch (notifyError) {
      console.error('Failed to trigger Inngest event:', notifyError);
    }
    // ------------------------------------

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    // Ensure we handle non-Error objects thrown
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        error: errorMessage || 'Failed to create order',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 },
    );
  }
}

