'use client'
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";
import RecommendationSlider from "@/components/RecommendationSlider";

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
