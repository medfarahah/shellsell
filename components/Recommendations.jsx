'use client';

import { useRelatedProducts, useTrendingProducts, usePersonalizedRecommendations } from '../lib/recommendation/useRecommendations';
import ProductCard from './ProductCard';
import Loading from './Loading';
import { useUser } from '@clerk/nextjs';

/**
 * Related Products Component
 * Shows products related to a specific product
 */
export function RelatedProducts({ productId, limit = 8, title = "You May Also Like" }) {
  const { products, loading, error } = useRelatedProducts(productId, { limit });

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (products.length === 0) return null;

  return (
    <div className="my-8">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

/**
 * Trending Products Component
 * Shows currently trending products
 */
export function TrendingProducts({ limit = 12, title = "Trending Now" }) {
  const { products, loading, error } = useTrendingProducts({ limit });

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (products.length === 0) return null;

  return (
    <div className="my-8">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

/**
 * Personalized Recommendations Component
 * Shows personalized recommendations based on user history
 */
export function PersonalizedRecommendations({ limit = 12, title = "Recommended For You" }) {
  const { user } = useUser();
  const { products, loading, error } = usePersonalizedRecommendations(
    user?.id,
    { limit }
  );

  if (!user) {
    // Fallback to trending for non-logged-in users
    return <TrendingProducts limit={limit} title={title} />;
  }

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (products.length === 0) return null;

  return (
    <div className="my-8">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

/**
 * Smart Recommendations Component
 * Automatically chooses the best recommendation type
 */
export function SmartRecommendations({ productId, userId, limit = 12 }) {
  const { user } = useUser();
  const currentUserId = userId || user?.id;

  // If viewing a product, show related products
  if (productId) {
    return <RelatedProducts productId={productId} limit={limit} />;
  }

  // If logged in, show personalized recommendations
  if (currentUserId) {
    return <PersonalizedRecommendations limit={limit} />;
  }

  // Otherwise, show trending
  return <TrendingProducts limit={limit} />;
}
