'use client';
import Loading from "../../components/Loading";
import {
    CircleDollarSignIcon,
    ShoppingBasketIcon,
    StarIcon,
    TagsIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

    const router = useRouter();
    const { user } = useUser();

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
    });

    const dashboardCardsData = [
        {
            title: "Total Products",
            value: dashboardData.totalProducts,
            icon: ShoppingBasketIcon,
        },
        {
            title: "Total Earnings",
            value: currency + dashboardData.totalEarnings,
            icon: CircleDollarSignIcon,
        },
        {
            title: "Total Orders",
            value: dashboardData.totalOrders,
            icon: TagsIcon,
        },
        {
            title: "Total Ratings",
            value: dashboardData.ratings.length,
            icon: StarIcon,
        },
    ];

    const fetchDashboardData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            const storeRes = await fetch(`/api/stores?userId=${user.id}`);
            if (!storeRes.ok) throw new Error("Failed to load store");
            const stores = await storeRes.json();
            const store = stores[0];
            if (!store) {
                setDashboardData({
                    totalProducts: 0,
                    totalEarnings: 0,
                    totalOrders: 0,
                    ratings: [],
                });
                return;
            }

            const [productsRes, ordersRes, ratingsRes] = await Promise.all([
                fetch(`/api/products?storeId=${store.id}`),
                fetch(`/api/orders?storeId=${store.id}`),
                fetch(`/api/ratings?storeId=${store.id}`), // You may adjust API to filter by store
            ]);

            const [products, orders, ratings] = await Promise.all([
                productsRes.json(),
                ordersRes.json(),
                ratingsRes.json(),
            ]);

            const totalEarnings = orders.reduce(
                (sum, order) => sum + order.total,
                0
            );

            setDashboardData({
                totalProducts: products.length,
                totalEarnings,
                totalOrders: orders.length,
                ratings,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    if (loading) return <Loading />;

    return (
        <div className=" text-slate-500 mb-28">
            <h1 className="text-2xl">
                Seller <span className="text-slate-800 font-medium">Dashboard</span>
            </h1>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {dashboardCardsData.map((card, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg"
                    >
                        <div className="flex flex-col gap-3 text-xs">
                            <p>{card.title}</p>
                            <b className="text-2xl font-medium text-slate-700">
                                {card.value}
                            </b>
                        </div>
                        <card.icon
                            size={50}
                            className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full"
                        />
                    </div>
                ))}
            </div>

            <h2 className="text-xl mt-10 mb-5">Total Reviews</h2>

            <div className="mt-5">
                {dashboardData.ratings.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-slate-400">
                        <p>No reviews yet</p>
                    </div>
                ) : (
                    dashboardData.ratings.map((review, index) => {
                        // Default placeholder avatar
                        const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ctext x='20' y='26' font-size='16' text-anchor='middle' fill='%239ca3af'%3E%3F%3C/text%3E%3C/svg%3E";
                        const userImage = review.user?.image && review.user.image.trim() !== ''
                            ? review.user.image
                            : defaultAvatar;

                        return (
                            <div
                                key={review.id || index}
                                className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl"
                            >
                                <div>
                                    <div className="flex gap-3">
                                        <Image
                                            src={userImage}
                                            alt={review.user?.name || 'User'}
                                            className="w-10 aspect-square rounded-full"
                                            width={40}
                                            height={40}
                                        />
                                        <div>
                                            <p className="font-medium">
                                                {review.user?.name || 'Anonymous'}
                                            </p>
                                            <p className="font-light text-slate-500">
                                                {new Date(
                                                    review.createdAt
                                                ).toDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-slate-500 max-w-xs leading-6">
                                        {review.review}
                                    </p>
                                </div>
                                <div className="flex flex-col justify-between gap-6 sm:items-end">
                                    <div className="flex flex-col sm:items-end">
                                        <p className="text-slate-400">
                                            {review.product?.category || 'N/A'}
                                        </p>
                                        <p className="font-medium">
                                            {review.product?.name || 'Product'}
                                        </p>
                                        <div className="flex items-center">
                                            {Array(5)
                                                .fill("")
                                                .map((_, index) => (
                                                    <StarIcon
                                                        key={index}
                                                        size={17}
                                                        className="text-transparent mt-0.5"
                                                        fill={
                                                            review.rating >= index + 1
                                                                ? "#00C950"
                                                                : "#D1D5DB"
                                                        }
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                    {review.product?.id && (
                                        <button
                                            onClick={() =>
                                                router.push(`/product/${review.product.id}`)
                                            }
                                            className="bg-slate-100 px-5 py-2 hover:bg-slate-200 rounded transition-all"
                                        >
                                            View Product
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}