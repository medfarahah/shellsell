'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import ProductCard from './ProductCard';
import Loading from './Loading';
import Title from './Title'; // Added Title import
import { getGuestBehavior } from '@/lib/tracking/behaviorTracker';

/**
 * RecommendationSlider Component
 * Displays personalized product recommendations in a grid (formerly a slider)
 */
export default function RecommendationSlider({
  title = "Suggested for You",
  limit = 12,
  className = ""
}) {
  const { user, isLoaded } = useUser();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isLoaded) return;

      try {
        setLoading(true);
        setError(null);

        let recommendations = [];

        if (user) {
          // Logged-in user: get personalized recommendations
          const response = await fetch(
            `/api/recommendations?type=personalized&userId=${user.id}&limit=${limit}`
          );

          if (!response.ok) {
            throw new Error('Failed to fetch personalized recommendations');
          }

          const data = await response.json();
          recommendations = data.products || [];
        } else {
          // Guest user: use guest behavior data
          const guestBehavior = getGuestBehavior();

          if (guestBehavior && guestBehavior.viewedCategories?.length > 0) {
            // Build query based on guest's viewed categories
            const categories = guestBehavior.viewedCategories
              .map(cat => cat.id || cat.name || cat)
              .filter(Boolean)
              .slice(0, 3)
              .join(',');

            // Fetch products from viewed categories
            const response = await fetch(
              `/api/products?category=${categories}&limit=${limit}`
            );

            if (response.ok) {
              const data = await response.json();
              recommendations = data || [];
            } else {
              // Fallback to trending
              const trendingResponse = await fetch(
                `/api/recommendations?type=trending&limit=${limit}`
              );
              if (trendingResponse.ok) {
                const trendingData = await trendingResponse.json();
                recommendations = trendingData.products || [];
              }
            }
          } else {
            // No guest behavior: show trending products
            const response = await fetch(
              `/api/recommendations?type=trending&limit=${limit}`
            );

            if (!response.ok) {
              throw new Error('Failed to fetch trending products');
            }

            const data = await response.json();
            recommendations = data.products || [];
          }
        }

        setProducts(recommendations);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, isLoaded, limit]);

  if (loading) {
    return (
      <div className={`px-6 my-20 max-w-6xl mx-auto ${className}`}>
        <Title title={title} description="Finding the best products for you..." />
        <Loading />
      </div>
    );
  }

  if (error) {
    return null; // Fail silently or show error
  }

  if (products.length === 0) {
    return null; // Don't show empty section
  }

  return (
    <div className={`px-6 my-20 max-w-6xl mx-auto ${className}`}>
      <Title title={title} description={`Showing ${products.length} recommended products`} />

      <div className='mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 xl:gap-12'>
        {products.map((product, index) => (
          <ProductCard key={product.id || index} product={product} />
        ))}
      </div>
    </div>
  );
}

