import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/products/[id] - include store and ratings with user for product page
export async function GET(_request, { params }) {
  try {
    // Handle both sync and async params (Next.js 15+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams || {};
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true,
          },
        },
        rating: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('GET /api/products/[id] error', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 },
    );
  }
}

// PUT /api/products/[id]
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams || {};
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      );
    }

    const data = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error('PUT /api/products/[id] error', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 },
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(_request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams || {};
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      );
    }

    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/products/[id] error', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 },
    );
  }
}

