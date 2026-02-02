'use client'
import ProductDescription from "../../../../components/ProductDescription";
import ProductDetails from "../../../../components/ProductDetails";
import RecommendationSlider from "../../../../components/RecommendationSlider";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { trackProductView } from "../../../../lib/tracking/behaviorTracker";

export default function Product() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProduct = async () => {
        if (!productId) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/products/${productId}`);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to load product");
            }
            const data = await res.json();
            setProduct(data);
        } catch (err) {
            console.error("Error fetching product:", err);
            // Product state remains null, which will show "Product not found" message
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchProduct();
            scrollTo(0, 0);
        }
    }, [productId]);

    // Track product view when product is loaded
    useEffect(() => {
        if (product) {
            trackProductView(product);
        }
    }, [product]);

    // Build Product schema for rich results (Product + Offer + AggregateRating)
    const productSchema = useMemo(() => {
        if (!product) return null;

        const ratings = product.rating || [];
        const hasRatings = ratings.length > 0;
        const averageRating = hasRatings
            ? ratings.reduce((acc, item) => acc + item.rating, 0) / ratings.length
            : 0;

        const price = Number(product.price) || 0;
        const currencyCode = "USD"; // Adjust if you use a different currency

        const schema = {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: product.images || [],
            description: product.description,
            category: product.category,
            sku: product.id,
            brand: product.store?.name || "Assal",
            offers: {
                "@type": "Offer",
                url: `https://assalpay.store/product/${product.id}`,
                priceCurrency: currencyCode,
                price,
                availability: "https://schema.org/InStock",
            },
        };

        if (hasRatings) {
            schema.aggregateRating = {
                "@type": "AggregateRating",
                ratingValue: Number(averageRating.toFixed(1)),
                reviewCount: ratings.length,
            };
        }

        return schema;
    }, [product]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
                Loading product...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
                Product not found
            </div>
        );
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">
                {productSchema && (
                    <script
                        type="application/ld+json"
                        // Product structured data for better visibility in search
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
                    />
                )}

                {/* Breadcrumbs */}
                <div className="text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product.category}
                </div>

                {/* Product Details */}
                <ProductDetails product={product} />

                {/* Description & Reviews */}
                <ProductDescription product={product} />

                {/* Related Products Recommendations */}
                <RecommendationSlider
                    title="You May Also Like"
                    limit={8}
                    className="mt-12"
                />
            </div>
        </div>
    );
}