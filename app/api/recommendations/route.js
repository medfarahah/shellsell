import { NextResponse } from 'next/server';
import {
  getRelatedProducts,
  getTrendingProducts,
  getPersonalizedRecommendations,
} from '@/lib/recommendation/recommendationService';

export const runtime = 'nodejs';

/**
 * GET /api/recommendations
 * Query params:
 * - type: 'related' | 'trending' | 'personalized'
 * - productId: required for 'related'
 * - userId: required for 'personalized'
 * - limit: number of results (default: 10)
 * - maxPerVendor: max products per vendor (default: 2)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'trending';
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const maxPerVendor = parseInt(searchParams.get('maxPerVendor') || '2', 10);

    let results = [];

    switch (type) {
      case 'related':
        if (!productId) {
          return NextResponse.json(
            { error: 'productId is required for related recommendations' },
            { status: 400 }
          );
        }
        results = await getRelatedProducts(productId, {
          limit,
          maxPerVendor,
          includeVendorBoost: true,
        });
        break;

      case 'trending':
        results = await getTrendingProducts({
          limit,
          maxPerVendor,
          days: 30,
        });
        break;

      case 'personalized':
        if (!userId) {
          // For guests, try to get recommendations based on guest behavior
          // This will be handled by the frontend, but we can also handle it here
          // For now, fallback to trending
          results = await getTrendingProducts({
            limit,
            maxPerVendor,
            days: 30,
          });
        } else {
          results = await getPersonalizedRecommendations(userId, {
            limit,
          });
        }
        break;

      default:
        return NextResponse.json(
          { error: `Invalid type: ${type}. Must be 'related', 'trending', or 'personalized'` },
          { status: 400 }
        );
    }

    // Remove internal scoring fields before returning
    const cleanedResults = results.map((product) => {
      const { score, contentScore, vendorMultiplier, recentOrders, vendorScore, avgProductRating, ...rest } = product;
      return rest;
    });

    return NextResponse.json({
      type,
      count: cleanedResults.length,
      products: cleanedResults,
    });
  } catch (error) {
    console.error('GET /api/recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', details: error.message },
      { status: 500 }
    );
  }
}
