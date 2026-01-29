/**
 * User Behavior Tracker
 * Tracks user interactions and sends events to the backend
 */

/**
 * Track a product view/click event
 * @param {Object} eventData - Event data
 * @param {string} eventData.productId - Product ID
 * @param {string} eventData.categoryId - Category ID or category name
 * @param {string[]} eventData.tags - Product tags
 * @param {string} eventData.eventType - Event type (default: 'product_view')
 * @param {string} eventData.userId - User ID (optional, will use Clerk if available)
 */
export const trackProductEvent = async (eventData) => {
  const {
    productId,
    categoryId,
    tags = [],
    eventType = 'product_view',
    userId = null,
  } = eventData;

  if (!productId) {
    console.warn('trackProductEvent: productId is required');
    return;
  }

  try {
    // Get user ID from Clerk if not provided
    let currentUserId = userId;
    if (!currentUserId && typeof window !== 'undefined') {
      // Try to get from Clerk (will be handled by the API route)
      const clerkUser = window.Clerk?.user;
      if (clerkUser) {
        currentUserId = clerkUser.id;
      }
    }

    // For guests, store in localStorage
    if (!currentUserId) {
      trackGuestBehavior({ productId, categoryId, tags });
    }

    // Send event to backend
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        productId,
        categoryId: categoryId || null,
        tags: Array.isArray(tags) ? tags : [],
        userId: currentUserId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to track event:', await response.text());
    }
  } catch (error) {
    console.error('Error tracking product event:', error);
    // Still track locally for guests even if API fails
    if (!userId) {
      trackGuestBehavior({ productId, categoryId, tags });
    }
  }
};

/**
 * Track guest behavior in localStorage
 * Stores last 5 viewed categories for guest users
 * @param {Object} data - Event data
 */
const trackGuestBehavior = ({ productId, categoryId, tags }) => {
  if (typeof window === 'undefined') return;

  try {
    const guestDataKey = 'guest_behavior';
    const guestData = JSON.parse(localStorage.getItem(guestDataKey) || '{}');

    // Track viewed categories (last 5)
    if (categoryId) {
      const viewedCategories = guestData.viewedCategories || [];
      // Remove if already exists
      const filtered = viewedCategories.filter((cat) => cat.id !== categoryId);
      // Add to front
      filtered.unshift({
        id: categoryId,
        name: categoryId, // Assuming categoryId is the name for now
        timestamp: new Date().toISOString(),
      });
      // Keep only last 5
      guestData.viewedCategories = filtered.slice(0, 5);
    }

    // Track viewed products (last 10)
    const viewedProducts = guestData.viewedProducts || [];
    const filtered = viewedProducts.filter((p) => p.id !== productId);
    filtered.unshift({
      id: productId,
      categoryId,
      tags,
      timestamp: new Date().toISOString(),
    });
    guestData.viewedProducts = filtered.slice(0, 10);

    // Track tags (frequency)
    const tagFrequency = guestData.tagFrequency || {};
    tags.forEach((tag) => {
      if (tag) {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      }
    });
    guestData.tagFrequency = tagFrequency;

    localStorage.setItem(guestDataKey, JSON.stringify(guestData));
  } catch (error) {
    console.error('Error storing guest behavior:', error);
  }
};

/**
 * Get guest behavior data from localStorage
 * @returns {Object} Guest behavior data
 */
export const getGuestBehavior = () => {
  if (typeof window === 'undefined') return null;

  try {
    const guestDataKey = 'guest_behavior';
    const data = localStorage.getItem(guestDataKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading guest behavior:', error);
    return null;
  }
};

/**
 * Clear guest behavior data
 */
export const clearGuestBehavior = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('guest_behavior');
  } catch (error) {
    console.error('Error clearing guest behavior:', error);
  }
};

/**
 * Track product click (wrapper for trackProductEvent)
 * @param {Object} product - Product object
 */
export const trackProductClick = (product) => {
  if (!product) return;

  const tags = [
    product.category,
    product.color,
    ...(product.sizes || []),
  ].filter(Boolean);

  trackProductEvent({
    productId: product.id,
    categoryId: product.category,
    tags,
    eventType: 'product_click',
  });
};

/**
 * Track product view (wrapper for trackProductEvent)
 * @param {Object} product - Product object
 */
export const trackProductView = (product) => {
  if (!product) return;

  const tags = [
    product.category,
    product.color,
    ...(product.sizes || []),
  ].filter(Boolean);

  trackProductEvent({
    productId: product.id,
    categoryId: product.category,
    tags,
    eventType: 'product_view',
  });
};
