'use client';
import StoreInfo from "@/components/admin/StoreInfo";
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminStores() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStores = async () => {
        try {
            // Fetch all stores (not filtered by isActive) for admin
            const res = await fetch("/api/stores?status=all");
            if (!res.ok) throw new Error("Failed to load stores");
            const data = await res.json();
            setStores(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleIsActive = async (storeId) => {
        try {
            const store = stores.find(s => s.id === storeId);
            if (!store) throw new Error("Store not found");

            const res = await fetch(`/api/stores/${storeId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !store.isActive, userId: store.userId }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to update store");
            }

            const updatedStore = await res.json();
            setStores(stores.map(s => s.id === storeId ? updatedStore : s));
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">
                Live <span className="text-slate-800 font-medium">Stores</span>
            </h1>

            {stores.length ? (
                <div className="flex flex-col gap-4 mt-4">
                    {stores.map((store) => (
                        <div
                            key={store.id}
                            className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-4xl"
                        >
                            {/* Store Info */}
                            <StoreInfo store={store} />

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2 flex-wrap">
                                <p>Active</p>
                                <label className="relative inline-flex items-center cursor-pointer text-gray-900">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        onChange={() =>
                                            toast.promise(
                                                toggleIsActive(store.id),
                                                { loading: "Updating data..." }
                                            )
                                        }
                                        checked={store.isActive}
                                    />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl text-slate-400 font-medium">
                        No stores Available
                    </h1>
                </div>
            )}
        </div>
    ) : (
        <Loading />
    );
}