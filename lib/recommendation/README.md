# Multi-Vendor Marketplace Recommendation Engine

A hybrid filtering recommendation system that combines Content-Based matching and Vendor Performance weighting for a multi-vendor marketplace.

## Features

- **Hybrid Filtering**: Combines content-based similarity (tags/categories) with vendor performance metrics
- **Vendor Diversity**: Ensures results don't show too many products from the same vendor
- **Vendor Performance Boost**: Products from highly-rated vendors (4.5+) get boosted in recommendations
- **Caching**: In-memory caching to prevent heavy database queries
- **Multiple Recommendation Types**: Related products, trending products, and personalized recommendations

## Algorithm Overview

### Similarity Score Calculation

1. **Content-Based Similarity** (70% tags, 30% category)
   - Uses Jaccard similarity for tag overlap
   - Exact match for category

2. **Vendor Reliability Multiplier**
   - 4.5+ rating: 1.5x boost
   - 4.0-4.5: 1.2x boost
   - 3.5-4.0: 1.0x (neutral)
   - 3.0-3.5: 0.8x (penalty)
   - <3.0: 0.5x (heavy penalty)

3. **Final Score**: `ContentSimilarity × VendorMultiplier`

### Vendor Diversity

Ensures no more than `maxPerVendor` products from the same vendor appear in results (default: 2).

## API Usage

### Get Related Products

```javascript
GET /api/recommendations?type=related&productId=PRODUCT_ID&limit=10&maxPerVendor=2
```

### Get Trending Products

```javascript
GET /api/recommendations?type=trending&limit=20&maxPerVendor=3
```

### Get Personalized Recommendations

```javascript
GET /api/recommendations?type=personalized&userId=USER_ID&limit=15
```

## Programmatic Usage

```javascript
import {
  getRelatedProducts,
  getTrendingProducts,
  getPersonalizedRecommendations,
  clearCache,
} from '@/lib/recommendation/recommendationService';

// Get related products
const related = await getRelatedProducts('product-id', {
  limit: 10,
  maxPerVendor: 2,
  includeVendorBoost: true,
});

// Get trending products
const trending = await getTrendingProducts({
  limit: 20,
  maxPerVendor: 3,
  days: 30,
});

// Get personalized recommendations
const personalized = await getPersonalizedRecommendations('user-id', {
  limit: 15,
});

// Clear cache
clearCache(); // Clear all
clearCache('related'); // Clear related products cache
```

## Caching

- **Default TTL**: 5 minutes for most queries
- **Vendor Metrics**: 10 minutes
- **Trending Products**: 15 minutes
- **Personalized**: 10 minutes

Cache keys:
- `related:${productId}:${limit}:${maxPerVendor}:${includeVendorBoost}`
- `trending:${limit}:${maxPerVendor}:${days}`
- `personalized:${userId}:${limit}`
- `vendor:${vendorId}`

## Performance Considerations

1. **Database Queries**: Uses Prisma with efficient includes to minimize queries
2. **Caching**: Aggressive caching to prevent repeated heavy computations
3. **Vendor Diversity**: Applied after scoring to maintain quality
4. **Async Processing**: All vendor metric lookups are parallelized

## Future Enhancements

- [ ] Redis integration for distributed caching
- [ ] Collaborative filtering based on user behavior
- [ ] Machine learning model integration
- [ ] A/B testing framework
- [ ] Real-time recommendation updates
- [ ] Analytics and recommendation performance tracking

## Schema Requirements

The recommendation engine expects the following Prisma schema:

```prisma
model Product {
  id          String   @id
  name        String
  category    String
  color       String?
  sizes       String[]
  storeId     String
  inStock     Boolean
  rating      Rating[]
  orderItems  OrderItem[]
  store       Store    @relation(...)
}

model Store {
  id          String   @id
  Product     Product[]
  Order       Order[]
}

model Rating {
  id        String   @id
  productId String
  rating    Int
  product   Product  @relation(...)
}

model Order {
  id        String   @id
  storeId   String
  orderItems OrderItem[]
  store     Store    @relation(...)
}
```

## Notes

- Tags are derived from `category`, `color`, and `sizes` fields
- Vendor ratings are calculated from product ratings
- New users automatically get trending products
- Results are sorted by score (highest first)
