# User Behavior Tracking System

A comprehensive client-side behavior tracking system that tracks user interactions and provides personalized recommendations.

## Features

- **Product Click Tracking**: Automatically tracks when users click on products
- **Guest Support**: Uses localStorage to track guest behavior (last 5 categories, last 10 products)
- **Event API**: Sends events to `/api/events` endpoint
- **Vendor Display**: Product cards show vendor name and rating
- **Recommendation Slider**: Carousel component for displaying personalized recommendations

## Usage

### Track Product Clicks

```javascript
import { trackProductClick, trackProductView } from '@/lib/tracking/behaviorTracker';

// Track when user clicks a product
trackProductClick(product);

// Track when user views a product page
trackProductView(product);
```

### Display Recommendations

```jsx
import RecommendationSlider from '@/components/RecommendationSlider';

// In your component
<RecommendationSlider 
  title="Suggested for You"
  limit={12}
  showNavigation={true}
/>
```

### Guest Behavior

The system automatically tracks guest behavior in localStorage:

- **Last 5 viewed categories**: Stored in `guest_behavior.viewedCategories`
- **Last 10 viewed products**: Stored in `guest_behavior.viewedProducts`
- **Tag frequency**: Tracks how often each tag is viewed

```javascript
import { getGuestBehavior, clearGuestBehavior } from '@/lib/tracking/behaviorTracker';

// Get guest behavior
const behavior = getGuestBehavior();
console.log(behavior.viewedCategories);

// Clear guest behavior
clearGuestBehavior();
```

## Product Card Updates

The `ProductCard` component now includes:

- **Vendor Name**: Displayed below product name
- **Vendor Rating**: Shows average rating from vendor's products
- **Automatic Tracking**: Tracks clicks automatically

## Recommendation Slider

The `RecommendationSlider` component:

- Fetches personalized recommendations for logged-in users
- Uses guest behavior data for non-logged-in users
- Falls back to trending products if no data available
- Responsive carousel with navigation
- Shows 2-4 items per view based on screen size

## API Endpoints

### POST /api/events

Track user behavior events.

```javascript
POST /api/events
Content-Type: application/json

{
  "eventType": "product_click",
  "productId": "product-123",
  "categoryId": "electronics",
  "tags": ["smartphone", "apple"],
  "userId": "user-123", // Optional, will use Clerk if available
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/events

Get user behavior data (for debugging/admin).

```javascript
GET /api/events?userId=user-123
```

## User Flow

1. **User clicks on "Hiking Boots"**
   - `ProductCard` calls `trackProductClick()`
   - Event sent to `/api/events` with productId, categoryId, tags
   - For guests: Stored in localStorage

2. **Backend learns user preferences**
   - Stores behavior in user's cart JSON (or dedicated table)
   - Tracks categories, products, and tag frequency

3. **User visits homepage**
   - `RecommendationSlider` fetches recommendations
   - For logged-in: Uses `/api/recommendations?type=personalized`
   - For guests: Uses localStorage data to fetch relevant products

4. **Display recommendations**
   - Shows products from top-rated vendors
   - Ensures vendor diversity
   - Displays vendor name and rating on each card

## Integration Example

```jsx
// pages/index.jsx or app/page.jsx
import RecommendationSlider from '@/components/RecommendationSlider';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <RecommendationSlider title="Suggested for You" />
      <BestSelling />
      <RecommendationSlider title="Trending Now" />
    </div>
  );
}
```

## Data Structure

### Guest Behavior (localStorage)

```json
{
  "viewedCategories": [
    { "id": "electronics", "name": "Electronics", "timestamp": "2024-01-01T00:00:00.000Z" },
    { "id": "clothing", "name": "Clothing", "timestamp": "2024-01-01T01:00:00.000Z" }
  ],
  "viewedProducts": [
    { "id": "product-123", "categoryId": "electronics", "tags": ["smartphone"], "timestamp": "2024-01-01T00:00:00.000Z" }
  ],
  "tagFrequency": {
    "smartphone": 5,
    "electronics": 3
  }
}
```

## Notes

- Tracking is non-blocking and won't affect page performance
- Guest data is automatically cleared when user logs in
- Vendor ratings are calculated from all products in the vendor's store
- Recommendations respect vendor diversity (max 2-3 per vendor)
