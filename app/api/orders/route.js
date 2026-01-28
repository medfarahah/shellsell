import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
        orderItems: true,
        address: true,
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
        total,
        userId,
        storeId,
        addressId,
        isPaid,
        paymentMethod,
        isCouponUsed,
        coupon,
        orderItems: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders error', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }
}

