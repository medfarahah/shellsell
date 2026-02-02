'use client'
import ProductDescription from "../../../../components/ProductDescription";
import ProductDetails from "../../../../components/ProductDetails";
import RecommendationSlider from "../../../../components/RecommendationSlider";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
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