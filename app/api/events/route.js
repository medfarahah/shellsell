import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

/**
 * POST /api/events - Track user behavior events
 * Body: { eventType, productId, categoryId, tags, userId, timestamp }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      eventType,
      productId,
      categoryId,
      tags = [],
      userId: providedUserId,
      timestamp,
    } = body;

    // Get user ID from Clerk if not provided
    const { userId: clerkUserId } = await auth();
    const userId = providedUserId || clerkUserId;

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    // For now, we'll store events in a simple way
    // In production, you might want a dedicated events table
    // For this implementation, we'll update user preferences or create a tracking record

    // If user is logged in, we can store in database
    if (userId) {
      try {
        // Create or update user behavior tracking
        // This is a simplified version - you might want a dedicated UserBehavior table
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          // Update user's cart JSON to include behavior tracking
          // In production, create a proper UserBehavior/Event table
          const cartData = typeof user.cart === 'object' ? user.cart : {};
          const behaviorData = cartData.behavior || {
            lastViewedCategories: [],
            lastViewedProducts: [],
            tagFrequency: {},
          };

          // Update last viewed categories
          if (categoryId) {
            const categories = behaviorData.lastViewedCategories || [];
            const filtered = categories.filter((cat) => cat !== categoryId);
            filtered.unshift(categoryId);
            behaviorData.lastViewedCategories = filtered.slice(0, 5);
          }

          // Update last viewed products
          const products = behaviorData.lastViewedProducts || [];
          const filtered = products.filter((p) => p !== productId);
          filtered.unshift(productId);
          behaviorData.lastViewedProducts = filtered.slice(0, 10);

          // Update tag frequency
          const tagFreq = behaviorData.tagFrequency || {};
          tags.forEach((tag) => {
            if (tag) {
              tagFreq[tag] = (tagFreq[tag] || 0) + 1;
            }
          });
          behaviorData.tagFrequency = tagFreq;

          // Update user cart with behavior data
          await prisma.user.update({
            where: { id: userId },
            data: {
              cart: {
                ...cartData,
                behavior: behaviorData,
              },
            },
          });
        }
      } catch (dbError) {
        console.error('Error storing behavior in database:', dbError);
        // Continue even if DB update fails
      }
    }

    // Log the event (you might want to use a proper logging service)
    console.log('Event tracked:', {
      eventType,
      productId,
      categoryId,
      tags,
      userId: userId || 'guest',
      timestamp: timestamp || new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
    });
  } catch (error) {
    console.error('POST /api/events error:', error);
    return NextResponse.json(
      { error: 'Failed to track event', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/events - Get user behavior data (for debugging/admin)
 * Query params: userId
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        cart: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const behaviorData = user.cart?.behavior || null;

    return NextResponse.json({
      userId,
      behavior: behaviorData,
    });
  } catch (error) {
    console.error('GET /api/events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
