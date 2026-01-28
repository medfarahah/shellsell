import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/products/[id]
export async function GET(_request, { params }) {
  const { id } = params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('GET /api/products/[id] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 },
    );
  }
}

// PUT /api/products/[id]
export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const data = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error('PUT /api/products/[id] error', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 },
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(_request, { params }) {
  const { id } = params;
  try {
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/products/[id] error', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 },
    );
  }
}

