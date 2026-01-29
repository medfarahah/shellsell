/**
 * Example usage of the Recommendation Engine
 * This file demonstrates how to use the recommendation service
 */

import {
  getRelatedProducts,
  getTrendingProducts,
  getPersonalizedRecommendations,
  clearCache,
  getCacheStats,
} from './recommendationService';

// Example 1: Get related products for a specific product
async function exampleRelatedProducts() {
  console.log('=== Example: Related Products ===');
  
  const productId = 'clx1234567890'; // Replace with actual product ID
  const related = await getRelatedProducts(productId, {
    limit: 10,
    maxPerVendor: 2,
    includeVendorBoost: true,
  });

  console.log(`Found ${related.length} related products:`);
  related.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} (Score: ${product.score.toFixed(3)})`);
    console.log(`   Vendor: ${product.store?.name || 'Unknown'}`);
    console.log(`   Price: $${product.price}`);
  });
}

// Example 2: Get trending products
async function exampleTrendingProducts() {
  console.log('\n=== Example: Trending Products ===');
  
  const trending = await getTrendingProducts({
    limit: 20,
    maxPerVendor: 3,
    days: 30, // Last 30 days
  });

  console.log(`Found ${trending.length} trending products:`);
  trending.slice(0, 5).forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   Trending Score: ${product.score.toFixed(3)}`);
    console.log(`   Recent Orders: ${product.recentOrders}`);
    console.log(`   Vendor Rating: ${product.vendorScore.toFixed(2)}`);
  });
}

// Example 3: Get personalized recommendations
async function examplePersonalizedRecommendations() {
  console.log('\n=== Example: Personalized Recommendations ===');
  
  const userId = 'user_1234567890'; // Replace with actual user ID
  const personalized = await getPersonalizedRecommendations(userId, {
    limit: 15,
  });

  console.log(`Found ${personalized.length} personalized recommendations:`);
  personalized.slice(0, 5).forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   Score: ${product.score.toFixed(3)}`);
    console.log(`   Category: ${product.category}`);
  });
}

// Example 4: Cache management
async function exampleCacheManagement() {
  console.log('\n=== Example: Cache Management ===');
  
  // Get cache statistics
  const stats = getCacheStats();
  console.log(`Cache size: ${stats.size} entries`);
  console.log(`Cache keys: ${stats.keys.slice(0, 5).join(', ')}...`);
  
  // Clear specific cache
  clearCache('related'); // Clear all related product caches
  console.log('Cleared related products cache');
  
  // Clear all cache
  clearCache();
  console.log('Cleared all cache');
}

// Example 5: Integration with API
async function exampleAPIUsage() {
  console.log('\n=== Example: API Usage ===');
  
  // Using fetch API
  const response = await fetch(
    '/api/recommendations?type=trending&limit=10&maxPerVendor=2'
  );
  const data = await response.json();
  
  console.log(`API returned ${data.count} products`);
  console.log(`Type: ${data.type}`);
}

// Run all examples
async function runExamples() {
  try {
    // Uncomment the examples you want to run
    // await exampleRelatedProducts();
    // await exampleTrendingProducts();
    // await examplePersonalizedRecommendations();
    // await exampleCacheManagement();
    // await exampleAPIUsage();
    
    console.log('\n✅ All examples completed!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Export for use in other files
export {
  exampleRelatedProducts,
  exampleTrendingProducts,
  examplePersonalizedRecommendations,
  exampleCacheManagement,
  exampleAPIUsage,
};

// Uncomment to run examples directly
// runExamples();
