'use client';
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Package, User, MapPin, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/Loading";
import OrderItem from "@/components/OrderItem";
import Image from "next/image";

export default function AccountPage() {
    const { user, isLoaded } = useUser();
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'addresses', 'profile'

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const [ordersRes, addressesRes] = await Promise.all([
                    fetch(`/api/orders?userId=${user.id}`),
                    fetch(`/api/addresses?userId=${user.id}`),
                ]);

                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    setOrders(ordersData);
                }

                if (addressesRes.ok) {
                    const addressesData = await addressesRes.json();
                    setAddresses(addressesData);
                }
            } catch (err) {
                console.error("Failed to fetch account data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded) {
            fetchData();
        }
    }, [user, isLoaded]);

    if (!isLoaded || loading) {
        return <Loading />;
    }

    if (!user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-slate-500 mb-4">
                        Please sign in to view your account
                    </h1>
                    <Link
                        href="/shop"
                        className="text-indigo-600 hover:text-indigo-700"
                    >
                        Go to Shop
                    </Link>
                </div>
            </div>
        );
    }

    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e5e7eb'/%3E%3Ctext x='50' y='65' font-size='40' text-anchor='middle' fill='%239ca3af'%3E%3F%3C/text%3E%3C/svg%3E";
    const userImage = user.imageUrl || defaultAvatar;

    return (
        <div className="min-h-screen mx-6 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">My Account</h1>
                    <p className="text-slate-500">Manage your account settings and orders</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <Image
                            src={userImage}
                            alt={user.fullName || 'User'}
                            width={80}
                            height={80}
                            className="rounded-full"
                        />
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800">
                                {user.fullName || 'User'}
                            </h2>
                            <p className="text-slate-500">{user.primaryEmailAddress?.emailAddress}</p>
                            <p className="text-sm text-slate-400 mt-1">
                                Member since {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'orders'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Package size={18} />
                            My Orders ({orders.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('addresses')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'addresses'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <MapPin size={18} />
                            Addresses ({addresses.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'profile'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <User size={18} />
                            Profile
                        </div>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                    {activeTab === 'orders' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-slate-800">My Orders</h2>
                                <Link
                                    href="/orders"
                                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                >
                                    View All Orders →
                                </Link>
                            </div>
                            {orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.slice(0, 5).map((order) => (
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
                                                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                                            order.status === 'DELIVERED'
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
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <ShoppingBag size={16} />
                                                <span>{order.orderItems.length} item(s)</span>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length > 5 && (
                                        <Link
                                            href="/orders"
                                            className="block text-center py-3 text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                                        >
                                            View All {orders.length} Orders
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500 mb-4">You have no orders yet</p>
                                    <Link
                                        href="/shop"
                                        className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Start Shopping
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-slate-800">My Addresses</h2>
                                <Link
                                    href="/cart"
                                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                >
                                    Add Address →
                                </Link>
                            </div>
                            {addresses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <h3 className="font-medium text-slate-800 mb-2">
                                                {address.name}
                                            </h3>
                                            <p className="text-sm text-slate-600 mb-1">
                                                {address.email}
                                            </p>
                                            <p className="text-sm text-slate-600 mb-1">
                                                {address.phone}
                                            </p>
                                            {(address.quartier || address.city || address.state) && (
                                                <p className="text-sm text-slate-600">
                                                    {[
                                                        address.quartier,
                                                        address.city,
                                                        address.state,
                                                        address.zip,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500 mb-4">You have no saved addresses</p>
                                    <Link
                                        href="/cart"
                                        className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Add Address
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800 mb-6">Profile Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Full Name
                                    </label>
                                    <p className="text-slate-600">{user.fullName || 'Not set'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Email
                                    </label>
                                    <p className="text-slate-600">
                                        {user.primaryEmailAddress?.emailAddress}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Account Created
                                    </label>
                                    <p className="text-slate-600">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-200">
                                <p className="text-sm text-slate-500 mb-4">
                                    To update your profile information, please use the account settings in the user menu.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
