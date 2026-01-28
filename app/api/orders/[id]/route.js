import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// PATCH /api/orders/[id] - update order status
export async function PATCH(request, { params }) {
  try {
    // Handle both sync and async params (Next.js 15+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const paramId = resolvedParams?.id;

    let body = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    const { status, id: bodyId } = body || {};
    const id = paramId || bodyId;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 },
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 },
      );
    }

    // Validate status enum
    const validStatuses = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 },
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
        user: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('PATCH /api/orders/[id] error', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 },
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 },
    );
  }
}
