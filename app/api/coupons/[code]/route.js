import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// DELETE /api/coupons/[code] - delete a coupon
export async function DELETE(request, { params }) {
  try {
    const { code } = params;

    await prisma.coupon.delete({
      where: { code },
    });

    return NextResponse.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/coupons/[code] error', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 },
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to delete coupon' },
      { status: 500 },
    );
  }
}
