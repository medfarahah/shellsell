import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/wishlist?userId=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        wishlist: true,
      },
    });

    // If user not found yet, treat as empty wishlist
    if (!user) {
      return NextResponse.json([]);
    }

    const wishlist = Array.isArray(user.wishlist) ? user.wishlist : [];
    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('GET /api/wishlist error', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 },
    );
  }
}

// POST /api/wishlist - toggle a product in the user's wishlist
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, userName, userEmail, userImage, product } = body || {};

    if (!userId || !product || !product.id) {
      return NextResponse.json(
        { error: 'userId and product with id are required' },
        { status: 400 },
      );
    }

    // Ensure user exists (create if needed)
    const existingUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        ...(userName ? { name: userName } : {}),
        ...(userEmail ? { email: userEmail } : {}),
        ...(userImage !== undefined ? { image: userImage } : {}),
      },
      create: {
        id: userId,
        name: userName || 'User',
        email: userEmail || '',
        image: userImage || '',
      },
    });

    const currentWishlist = Array.isArray(existingUser.wishlist)
      ? existingUser.wishlist
      : [];

    const index = currentWishlist.findIndex((p) => p.id === product.id);
    let updatedWishlist;

    if (index >= 0) {
      // Remove from wishlist
      updatedWishlist = [
        ...currentWishlist.slice(0, index),
        ...currentWishlist.slice(index + 1),
      ];
    } else {
      // Add to wishlist (store a minimal snapshot)
      const snapshot = {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        category: product.category,
        storeId: product.storeId,
      };
      updatedWishlist = [...currentWishlist, snapshot];
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        wishlist: updatedWishlist,
      },
      select: {
        wishlist: true,
      },
    });

    return NextResponse.json(updatedUser.wishlist);
  } catch (error) {
    console.error('POST /api/wishlist error', error);
    return NextResponse.json(
      { error: 'Failed to update wishlist' },
      { status: 500 },
    );
  }
}

