/**
 * Multi-Vendor Marketplace Recommendation Engine
 * Hybrid Filtering: Content-Based + Vendor Performance
 */

import prisma from '../prisma';

// Simple in-memory cache (can be replaced with Redis)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Cache helper functions
 */
const cacheGet = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    cache.delete(key);
    return null;
  }
  return cached.data;
};

const cacheSet = (key, data, ttl = CACHE_TTL) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
};

const cacheClear = (pattern) => {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

/**
 * Calculate Jaccard similarity between two tag arrays
 * @param {string[]} tags1 - First product tags
 * @param {string[]} tags2 - Second product tags
 * @returns {number} Similarity score between 0 and 1
 */
const calculateTagSimilarity = (tags1 = [], tags2 = []) => {
  if (tags1.length === 0 && tags2.length === 0) return 0;
  if (tags1.length === 0 || tags2.length === 0) return 0;

  const set1 = new Set(tags1);
  const set2 = new Set(tags2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
};

/**
 * Calculate category similarity
 * @param {string} category1 - First product category
 * @param {string} category2 - Second product category
 * @returns {number} Similarity score (1 if same, 0 if different)
 */
const calculateCategorySimilarity = (category1, category2) => {
  if (!category1 || !category2) return 0;
  return category1.toLowerCase() === category2.toLowerCase() ? 1 : 0;
};

/**
 * Calculate vendor reliability multiplier
 * @param {number} avgVendorRating - Average vendor rating
 * @returns {number} Multiplier between 0.5 and 1.5
 */
const calculateVendorReliability = (avgVendorRating) => {
  if (!avgVendorRating || avgVendorRating < 0) return 0.5;
  if (avgVendorRating >= 4.5) return 1.5; // Boost high-rated vendors
  if (avgVendorRating >= 4.0) return 1.2;
  if (avgVendorRating >= 3.5) return 1.0;
  if (avgVendorRating >= 3.0) return 0.8;
  return 0.5; // Penalize low-rated vendors
};

/**
 * Calculate content-based similarity score
 * @param {Object} product1 - First product
 * @param {Object} product2 - Second product
 * @returns {number} Similarity score
 */
const calculateContentSimilarity = (product1, product2) => {
  const tagSimilarity = calculateTagSimilarity(
    product1.tags || [],
    product2.tags || []
  );
  const categorySimilarity = calculateCategorySimilarity(
    product1.category,
    product2.category
  );

  // Weighted combination: 70% tags, 30% category
  return tagSimilarity * 0.7 + categorySimilarity * 0.3;
};

/**
 * Ensure vendor diversity in results
 * @param {Array} products - Array of products with scores
 * @param {number} maxPerVendor - Maximum products per vendor
 * @returns {Array} Diversified product array
 */
const ensureVendorDiversity = (products, maxPerVendor = 2) => {
  const vendorCount = {};
  const diversified = [];

  for (const product of products) {
    const vendorId = product.storeId || product.vendorId;
    vendorCount[vendorId] = (vendorCount[vendorId] || 0) + 1;

    if (vendorCount[vendorId] <= maxPerVendor) {
      diversified.push(product);
    }
  }

  return diversified;
};

/**
 * Get vendor performance metrics
 * @param {string} vendorId - Vendor/Store ID
 * @returns {Promise<Object>} Vendor metrics
 */
const getVendorMetrics = async (vendorId) => {
  const cacheKey = `vendor:${vendorId}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const store = await prisma.store.findUnique({
      where: { id: vendorId },
      include: {
        Product: {
          include: {
            rating: true,
          },
        },
      },
    });

    if (!store) {
      return { avgRating: 0, totalProducts: 0, totalOrders: 0 };
    }

    // Calculate average rating from product ratings
    const allRatings = store.Product.flatMap((p) => p.rating || []);
    const avgRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        : 0;

    // Get order count
    const orderCount = await prisma.order.count({
      where: { storeId: vendorId },
    });

    const metrics = {
      avgRating: avgRating || 0,
      totalProducts: store.Product.length,
      totalOrders: orderCount,
    };

    cacheSet(cacheKey, metrics, 10 * 60 * 1000); // Cache for 10 minutes
    return metrics;
  } catch (error) {
    console.error(`Error fetching vendor metrics for ${vendorId}:`, error);
    return { avgRating: 0, totalProducts: 0, totalOrders: 0 };
  }
};

/**
 * Get related products for a specific product
 * @param {string} productId - Product ID
 * @param {Object} options - Options for recommendation
 * @param {number} options.limit - Number of recommendations (default: 10)
 * @param {number} options.maxPerVendor - Max products per vendor (default: 2)
 * @param {boolean} options.includeVendorBoost - Include vendor performance boost (default: true)
 * @returns {Promise<Array>} Array of recommended products with scores
 */
export const getRelatedProducts = async (productId, options = {}) => {
  const {
    limit = 10,
    maxPerVendor = 2,
    includeVendorBoost = true,
  } = options;

  const cacheKey = `related:${productId}:${limit}:${maxPerVendor}:${includeVendorBoost}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  try {
    // Get the source product
    const sourceProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        rating: true,
        store: true,
      },
    });

    if (!sourceProduct) {
      return [];
    }

    // Extract tags from product (using category, color, sizes as tags)
    const sourceTags = [
      sourceProduct.category,
      sourceProduct.color,
      ...(sourceProduct.sizes || []),
    ].filter(Boolean);

    // Get all other products (excluding the source)
    const allProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        inStock: true,
      },
      include: {
        rating: true,
        store: {
          include: {
            Product: {
              include: {
                rating: true,
              },
            },
          },
        },
      },
    });

    // Calculate scores for each product
    const scoredProducts = await Promise.all(
      allProducts.map(async (product) => {
        const productTags = [
          product.category,
          product.color,
          ...(product.sizes || []),
        ].filter(Boolean);

        // Content-based similarity
        const contentScore = calculateContentSimilarity(
          { tags: sourceTags, category: sourceProduct.category },
          { tags: productTags, category: product.category }
        );

        // Vendor reliability multiplier
        let vendorMultiplier = 1.0;
        if (includeVendorBoost) {
          const vendorMetrics = await getVendorMetrics(product.storeId);
          vendorMultiplier = calculateVendorReliability(vendorMetrics.avgRating);
        }

        // Final score
        const finalScore = contentScore * vendorMultiplier;

        return {
          ...product,
          score: finalScore,
          contentScore,
          vendorMultiplier,
        };
      })
    );

    // Sort by score (highest first)
    scoredProducts.sort((a, b) => b.score - a.score);

    // Ensure vendor diversity
    const diversified = ensureVendorDiversity(scoredProducts, maxPerVendor);

    // Limit results
    const results = diversified.slice(0, limit);

    cacheSet(cacheKey, results);
    return results;
  } catch (error) {
    console.error(`Error getting related products for ${productId}:`, error);
    return [];
  }
};

/**
 * Get trending products for new users
 * @param {Object} options - Options for trending
 * @param {number} options.limit - Number of products (default: 20)
 * @param {number} options.maxPerVendor - Max products per vendor (default: 3)
 * @param {number} options.days - Days to look back (default: 30)
 * @returns {Promise<Array>} Array of trending products
 */
export const getTrendingProducts = async (options = {}) => {
  const { limit = 20, maxPerVendor = 3, days = 30 } = options;

  const cacheKey = `trending:${limit}:${maxPerVendor}:${days}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get products with recent orders and high vendor ratings
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
        createdAt: { gte: cutoffDate },
      },
      include: {
        rating: true,
        store: {
          include: {
            Product: {
              include: {
                rating: true,
              },
            },
            Order: {
              where: {
                createdAt: { gte: cutoffDate },
              },
            },
          },
        },
        orderItems: {
          where: {
            order: {
              createdAt: { gte: cutoffDate },
            },
          },
        },
      },
    });

    // Calculate trending scores
    const scoredProducts = await Promise.all(
      products.map(async (product) => {
        // Recent order count (popularity)
        const recentOrders = product.orderItems.length;

        // Vendor performance
        const vendorMetrics = await getVendorMetrics(product.storeId);
        const vendorScore = calculateVendorReliability(vendorMetrics.avgRating);

        // Product rating
        const productRatings = product.rating || [];
        const avgProductRating =
          productRatings.length > 0
            ? productRatings.reduce((sum, r) => sum + r.rating, 0) /
              productRatings.length
            : 0;

        // Time decay (newer products get slight boost)
        const daysSinceCreation =
          (Date.now() - new Date(product.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        const recencyBoost = Math.max(0, 1 - daysSinceCreation / days);

        // Trending score formula
        const trendingScore =
          recentOrders * 0.4 + // 40% weight on recent orders
          vendorScore * 0.3 + // 30% weight on vendor performance
          avgProductRating * 0.2 + // 20% weight on product rating
          recencyBoost * 0.1; // 10% weight on recency

        return {
          ...product,
          score: trendingScore,
          recentOrders,
          vendorScore,
          avgProductRating,
        };
      })
    );

    // Sort by trending score
    scoredProducts.sort((a, b) => b.score - a.score);

    // Ensure vendor diversity
    const diversified = ensureVendorDiversity(scoredProducts, maxPerVendor);

    // Limit results
    const results = diversified.slice(0, limit);

    cacheSet(cacheKey, results, 15 * 60 * 1000); // Cache for 15 minutes
    return results;
  } catch (error) {
    console.error('Error getting trending products:', error);
    return [];
  }
};

/**
 * Get personalized recommendations based on user history
 * @param {string} userId - User ID
 * @param {Object} options - Options for recommendations
 * @param {number} options.limit - Number of recommendations (default: 15)
 * @returns {Promise<Array>} Array of recommended products
 */
export const getPersonalizedRecommendations = async (userId, options = {}) => {
  const { limit = 15 } = options;

  const cacheKey = `personalized:${userId}:${limit}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  try {
    // Get user's order history
    const userOrders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                rating: true,
                store: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Last 10 orders
    });

    // Extract purchased product IDs
    const purchasedProductIds = new Set();
    userOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        purchasedProductIds.add(item.productId);
      });
    });

    if (purchasedProductIds.size === 0) {
      // New user - return trending products
      return await getTrendingProducts({ limit });
    }

    // Get categories and tags from purchased products
    const purchasedProducts = await prisma.product.findMany({
      where: { id: { in: Array.from(purchasedProductIds) } },
    });

    const preferredCategories = new Set();
    const preferredTags = new Set();

    purchasedProducts.forEach((product) => {
      preferredCategories.add(product.category);
      if (product.color) preferredTags.add(product.color);
      if (product.sizes) {
        product.sizes.forEach((size) => preferredTags.add(size));
      }
    });

    // Find similar products
    const candidateProducts = await prisma.product.findMany({
      where: {
        id: { notIn: Array.from(purchasedProductIds) },
        inStock: true,
      },
      include: {
        rating: true,
        store: {
          include: {
            Product: {
              include: {
                rating: true,
              },
            },
          },
        },
      },
    });

    // Score candidates
    const scoredProducts = await Promise.all(
      candidateProducts.map(async (product) => {
        const productTags = [
          product.category,
          product.color,
          ...(product.sizes || []),
        ].filter(Boolean);

        // Category match
        const categoryMatch = preferredCategories.has(product.category) ? 1 : 0;

        // Tag overlap
        const tagOverlap = productTags.filter((tag) =>
          preferredTags.has(tag)
        ).length;
        const tagScore = Math.min(tagOverlap / preferredTags.size, 1);

        // Content score
        const contentScore = categoryMatch * 0.5 + tagScore * 0.5;

        // Vendor boost
        const vendorMetrics = await getVendorMetrics(product.storeId);
        const vendorMultiplier = calculateVendorReliability(
          vendorMetrics.avgRating
        );

        // Final score
        const finalScore = contentScore * vendorMultiplier;

        return {
          ...product,
          score: finalScore,
          contentScore,
          vendorMultiplier,
        };
      })
    );

    // Sort and diversify
    scoredProducts.sort((a, b) => b.score - a.score);
    const diversified = ensureVendorDiversity(scoredProducts, 2);
    const results = diversified.slice(0, limit);

    cacheSet(cacheKey, results, 10 * 60 * 1000); // Cache for 10 minutes
    return results;
  } catch (error) {
    console.error(`Error getting personalized recommendations for ${userId}:`, error);
    // Fallback to trending
    return await getTrendingProducts({ limit });
  }
};

/**
 * Clear recommendation cache
 * @param {string} pattern - Optional pattern to match cache keys
 */
export const clearCache = (pattern) => {
  cacheClear(pattern);
};

/**
 * Get cache statistics (for monitoring)
 * @returns {Object} Cache stats
 */
export const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
};
