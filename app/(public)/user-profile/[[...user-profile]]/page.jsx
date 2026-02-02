'use client';
import { UserProfile } from "@clerk/nextjs";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import OrderItem from "../../../../components/OrderItem";
import Loading from "../../../../components/Loading";

export default function UserProfilePage() {
    const { user } = useUser();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`/api/orders?userId=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    return (
        <div className="min-h-screen flex items-center justify-center py-8 px-4">
            <UserProfile
                routing="path"
                path="/user-profile"
                appearance={{
                    elements: {
                        rootBox: "mx-auto w-full max-w-4xl",
                        card: "shadow-lg",
                    }
                }}
            >
                <UserProfile.Page
                    label="My Orders"
                    labelIcon={<Package size={16} />}
                    url="orders"
                >
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">My Orders</h2>
                        {loading ? (
                            <Loading />
                        ) : orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-slate-800">
                                                    Order #{order.id.slice(0, 8)}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-slate-800">
                                                    ${order.total.toFixed(2)}
                                                </p>
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${order.status === 'DELIVERED'
                                                            ? 'bg-green-100 text-green-700'
                                                            : order.status === 'SHIPPED'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : order.status === 'PROCESSING'
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-slate-100 text-slate-700'
                                                        }`}
                                                >
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            {order.orderItems.length} item(s)
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500">You have no orders yet</p>
                            </div>
                        )}
                    </div>
                </UserProfile.Page>
            </UserProfile>
        </div>
    );
}
