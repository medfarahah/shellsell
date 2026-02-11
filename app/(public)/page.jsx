'use client';

import dynamic from 'next/dynamic';
import Hero from "../../components/Hero";
import LatestProducts from "../../components/LatestProducts";

// Lazy load heavy components
const RecommendationSlider = dynamic(
    () => import("../../components/RecommendationSlider"),
    { ssr: false }
);
const BestSelling = dynamic(
    () => import("../../components/BestSelling"),
    { ssr: false }
);
const OurSpecs = dynamic(
    () => import("../../components/OurSpec"),
    { ssr: false }
);
const Newsletter = dynamic(
    () => import("../../components/Newsletter"),
    { ssr: false }
);

export default function Home() {
    return (
        <div>
            <Hero />
            <LatestProducts />
            <RecommendationSlider title="Suggested for You" limit={12} />
            <BestSelling />
            <OurSpecs />
            <Newsletter />
        </div>
    );
}
