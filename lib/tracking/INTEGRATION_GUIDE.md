# Behavior Tracking & Recommendations Integration Guide

## Overview

This system tracks user behavior and displays personalized recommendations using a hybrid approach that works for both logged-in users and guests.

## Components Created

### 1. Behavior Tracker (`lib/tracking/behaviorTracker.js`)

**Functions:**
- `trackProductClick(product)` - Tracks when user clicks a product
- `trackProductView(product)` - Tracks when user views a product page
- `getGuestBehavior()` - Gets guest behavior from localStorage
- `clearGuestBehavior()` - Clears guest data

**Usage:**
```javascript
import { trackProductClick } from '@/lib/tracking/behaviorTracker';

// Automatically called by ProductCard, but can be used manually
trackProductClick(product);
```

### 2. Recommendation Slider (`components/RecommendationSlider.jsx`)

**Props:**
- `title` - Section title (default: "Suggested for You")
- `limit` - Number of products to fetch (default: 12)
- `showNavigation` - Show prev/next buttons (default: true)
- `className` - Additional CSS classes

**Usage:**
```jsx
import RecommendationSlider from '@/components/RecommendationSlider';

<RecommendationSlider 
  title="Suggested for You"
  limit={12}
  showNavigation={true}
/>
```

### 3. Updated Product Card (`components/ProductCard.jsx`)

**New Features:**
- Automatically tracks clicks
- Shows vendor name
- Shows vendor rating (calculated from vendor's products)
- Enhanced layout with vendor info

### 4. Events API (`app/api/events/route.js`)

**Endpoints:**
- `POST /api/events` - Track user behavior
- `GET /api/events?userId=xxx` - Get user behavior (admin/debug)

## User Flow Examples

### Logged-In User Flow

1. User clicks "Hiking Boots" product
   ```
   ProductCard → trackProductClick() → POST /api/events
   Body: { productId, categoryId: "footwear", tags: ["hiking", "boots"] }
   ```

2. Backend stores behavior
   ```
   /api/events → Updates user.cart.behavior in database
   Stores: lastViewedCategories, lastViewedProducts, tagFrequency
   ```

3. User visits homepage
   ```
   RecommendationSlider → GET /api/recommendations?type=personalized&userId=xxx
   Backend uses behavior data to recommend similar products
   ```

4. Display recommendations
   ```
   Shows products from top-rated vendors (4.5+ rating)
   Ensures vendor diversity (max 2 per vendor)
   Each card shows vendor name and rating
   ```

### Guest User Flow

1. Guest clicks "Hiking Boots"
   ```
   ProductCard → trackProductClick() → localStorage
   Stores in: guest_behavior.viewedCategories, viewedProducts
   ```

2. Guest visits homepage
   ```
   RecommendationSlider → Checks localStorage
   Uses viewedCategories to fetch products from those categories
   Falls back to trending if no data
   ```

3. Guest logs in
   ```
   Guest behavior can be migrated to user account
   (Implementation left for future enhancement)
   ```

## Integration Points

### Homepage
```jsx
// app/(public)/page.jsx
<RecommendationSlider title="Suggested for You" limit={12} />
```

### Product Page
```jsx
// app/(public)/product/[productId]/page.jsx
// Automatically tracks product view
// Shows related products at bottom
<RecommendationSlider title="You May Also Like" limit={8} />
```

### Shop Page
```jsx
// Can add to any page
<RecommendationSlider title="Trending Now" limit={16} />
```

## Data Flow Diagram

```
User Action (Click Product)
    ↓
ProductCard Component
    ↓
trackProductClick()
    ↓
┌─────────────────┬─────────────────┐
│  Logged In      │  Guest          │
│  POST /api/events│  localStorage  │
│  → Database     │  → guest_behavior│
└─────────────────┴─────────────────┘
    ↓
RecommendationSlider Component
    ↓
┌─────────────────┬─────────────────┐
│  Logged In      │  Guest          │
│  GET /api/      │  Read localStorage│
│  recommendations│  → Fetch by     │
│  ?type=         │    categories   │
│  personalized   │                 │
└─────────────────┴─────────────────┘
    ↓
Display Products with Vendor Info
```

## Testing

### Test Behavior Tracking
```javascript
// In browser console
import { trackProductClick } from '@/lib/tracking/behaviorTracker';
trackProductClick({ id: 'test', category: 'test', color: 'red' });

// Check localStorage (for guests)
localStorage.getItem('guest_behavior');

// Check API (for logged-in)
fetch('/api/events?userId=YOUR_USER_ID');
```

### Test Recommendations
```javascript
// Test API directly
fetch('/api/recommendations?type=trending&limit=5')
  .then(r => r.json())
  .then(console.log);
```

## Performance Considerations

- **Non-blocking tracking**: Events are sent asynchronously
- **Caching**: Recommendations are cached (5-15 minutes)
- **Lazy loading**: RecommendationSlider only fetches when mounted
- **Guest storage**: Limited to last 5 categories, 10 products

## Future Enhancements

- [ ] Migrate guest behavior to user account on login
- [ ] Real-time recommendation updates
- [ ] A/B testing framework
- [ ] Analytics dashboard
- [ ] Machine learning integration
- [ ] Redis caching for distributed systems
