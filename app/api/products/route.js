import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/products - list products, optional ?category=&storeId=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const storeId = searchParams.get('storeId');

  const where = {};
  if (category) where.category = category;
  if (storeId) where.storeId = storeId;

  try {
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products error', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}

// POST /api/products - create product
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      mrp,
      price,
      images,
      category,
      storeId,
      inStock = true,
    } = body;

    if (!name || !description || !mrp || !price || !images || !category || !storeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        images,
        category,
        storeId,
        inStock,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 },
    );
  }
}

