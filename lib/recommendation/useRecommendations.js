/**
 * React Hook for fetching recommendations
 * Usage in React components
 */

import { useState, useEffect } from 'react';

/**
 * Hook to fetch related products
 * @param {string} productId - Product ID
 * @param {Object} options - Options
 * @returns {Object} { products, loading, error }
 */
export const useRelatedProducts = (productId, options = {}) => {
  const { limit = 10, maxPerVendor = 2 } = options;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchRelated = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/recommendations?type=related&productId=${productId}&limit=${limit}&maxPerVendor=${maxPerVendor}`
        );
        if (!res.ok) throw new Error('Failed to fetch related products');
        const data = await res.json();
        setProducts(data.products || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [productId, limit, maxPerVendor]);

  return { products, loading, error };
};

/**
 * Hook to fetch trending products
 * @param {Object} options - Options
 * @returns {Object} { products, loading, error }
 */
export const useTrendingProducts = (options = {}) => {
  const { limit = 20, maxPerVendor = 3 } = options;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/recommendations?type=trending&limit=${limit}&maxPerVendor=${maxPerVendor}`
        );
        if (!res.ok) throw new Error('Failed to fetch trending products');
        const data = await res.json();
        setProducts(data.products || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching trending products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [limit, maxPerVendor]);

  return { products, loading, error };
};

/**
 * Hook to fetch personalized recommendations
 * @param {string} userId - User ID
 * @param {Object} options - Options
 * @returns {Object} { products, loading, error }
 */
export const usePersonalizedRecommendations = (userId, options = {}) => {
  const { limit = 15 } = options;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPersonalized = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/recommendations?type=personalized&userId=${userId}&limit=${limit}`
        );
        if (!res.ok) throw new Error('Failed to fetch personalized recommendations');
        const data = await res.json();
        setProducts(data.products || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching personalized recommendations:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalized();
  }, [userId, limit]);

  return { products, loading, error };
};
