'use client'
import { Suspense, useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { MoveLeftIcon, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setProduct } from "@/lib/features/product/productSlice";

function ShopContent() {
    // get query params ?search=abc
    const searchParams = useSearchParams();
    const search = searchParams.get("search");
    const router = useRouter();
    const dispatch = useDispatch();

    const [searchTerm, setSearchTerm] = useState(search || "");

    const products = useSelector((state) => state.product.list);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/products");
                if (!res.ok) throw new Error("Failed to load products");
                const data = await res.json();
                dispatch(setProduct(data));
            } catch (err) {
                console.error(err);
            }
        };

        fetchProducts();
    }, [dispatch]);

    const filteredProducts = search
        ? products.filter((product) =>
              product.name.toLowerCase().includes(search.toLowerCase())
          )
        : products;

    const handleSearch = (e) => {
        e.preventDefault();
        router.push(`/shop?search=${searchTerm}`);
    };

    return (
        <div className="min-h-[70vh] mx-6">
            <div className=" max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 my-6">
                    <h1
                        onClick={() => router.push("/shop")}
                        className="text-2xl text-slate-500 flex items-center gap-2 cursor-pointer"
                    >
                        {search && <MoveLeftIcon size={20} />} All{" "}
                        <span className="text-slate-700 font-medium">
                            Products
                        </span>
                    </h1>

                    <form
                        onSubmit={handleSearch}
                        className="relative w-full md:w-80"
                    >
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                    </form>
                </div>

                <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}


export default function Shop() {
    return (
        <Suspense fallback={<div>Loading shop...</div>}>
            <ShopContent />
        </Suspense>
    );
}