import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import AddressModal from './AddressModal';
import { useSelector, useDispatch } from 'react-redux';
import { setAddresses } from '../lib/features/address/addressSlice';
import { clearCart } from '../lib/features/cart/cartSlice';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const router = useRouter();
    const { user } = useUser();
    const dispatch = useDispatch();

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch addresses when component mounts
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return;

            try {
                const res = await fetch(`/api/addresses?userId=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    dispatch(setAddresses(data));
                }
            } catch (err) {
                console.error("Failed to fetch addresses:", err);
            }
        };

        fetchAddresses();
    }, [user, dispatch]);

    const handleCouponCode = async (event) => {
        event.preventDefault();

        if (!couponCodeInput.trim()) {
            toast.error("Please enter a coupon code");
            return;
        }

        if (!user) {
            toast.error("Please sign in to use coupons");
            return;
        }

        try {
            // First, check if user is a new user (has no previous orders)
            const ordersRes = await fetch(`/api/orders?userId=${user.id}`);
            const previousOrders = ordersRes.ok ? await ordersRes.json() : [];
            const isNewUser = previousOrders.length === 0;

            // Try to fetch coupon - first try public, then try new user coupons
            let res = await fetch(`/api/coupons?code=${couponCodeInput.trim()}&onlyPublic=true`);
            let coupons = res.ok ? await res.json() : [];

            // If not found in public, try new user coupons
            if (coupons.length === 0) {
                res = await fetch(`/api/coupons?code=${couponCodeInput.trim()}&forNewUser=true`);
                coupons = res.ok ? await res.json() : [];
            }

            if (coupons.length === 0) {
                toast.error("Invalid or expired coupon code");
                return;
            }

            const foundCoupon = coupons[0];

            // Check if coupon is expired
            if (new Date(foundCoupon.expiresAt) < new Date()) {
                toast.error("This coupon has expired");
                return;
            }

            // Check if coupon is for new users only
            if (foundCoupon.forNewUser && !isNewUser) {
                toast.error("This coupon is only available for new users");
                return;
            }

            setCoupon(foundCoupon);
            toast.success("Coupon applied successfully!");
            setCouponCodeInput("");
        } catch (err) {
            console.error("Coupon validation error:", err);
            toast.error(err.message || "Invalid coupon code");
        }
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please sign in to place an order");
            return;
        }

        if (items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        if (!selectedAddress) {
            toast.error("Please select or add an address");
            return;
        }

        // Group items by store (since each product belongs to a store)
        const itemsByStore = {};
        for (const item of items) {
            // Get storeId from product's store relation or direct storeId field
            const storeId = item.storeId || item.store?.id;

            if (!storeId) {
                toast.error(`Product ${item.name} is missing store information`);
                setLoading(false);
                return;
            }

            if (!itemsByStore[storeId]) {
                itemsByStore[storeId] = [];
            }
            itemsByStore[storeId].push({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
                selectedColor: item.selectedColor || null,
                selectedSize: item.selectedSize || null,
            });
        }

        setLoading(true);

        try {
            // Create orders for each store
            const orderPromises = Object.entries(itemsByStore).map(async ([storeId, storeItems]) => {
                const storeTotal = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const finalTotal = coupon
                    ? storeTotal - (coupon.discount / 100 * storeTotal)
                    : storeTotal;

                const res = await fetch("/api/orders", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        total: finalTotal,
                        userId: user.id,
                        storeId: storeId,
                        addressId: selectedAddress.id,
                        isPaid: paymentMethod === 'STRIPE', // Only STRIPE is paid, COD is not
                        paymentMethod: paymentMethod,
                        isCouponUsed: !!coupon,
                        coupon: coupon || {},
                        orderItems: storeItems,
                    }),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    const errorMessage = errorData.error || errorData.message || "Failed to create order";
                    console.error("Order creation failed:", errorData);
                    throw new Error(errorMessage);
                }

                return res.json();
            });

            await Promise.all(orderPromises);

            // Clear cart
            dispatch(clearCart());

            toast.success("Order placed successfully!");
            router.push('/orders');
        } catch (err) {
            console.error("Order creation error:", err);
            toast.error(err.message || "Failed to place order");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>COD</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="STRIPE" name='payment' onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} className='accent-gray-500' />
                <label htmlFor="STRIPE" className='cursor-pointer'>Stripe Payment</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>
                                {selectedAddress.name}
                                {selectedAddress.quartier && `, ${selectedAddress.quartier}`}
                                {selectedAddress.city && `, ${selectedAddress.city}`}
                                {selectedAddress.state && `, ${selectedAddress.state}`}
                                {selectedAddress.zip && `, ${selectedAddress.zip}`}
                            </p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => {
                                        const index = parseInt(e.target.value);
                                        if (index >= 0 && index < addressList.length) {
                                            setSelectedAddress(addressList[index]);
                                        }
                                    }} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={address.id || index} value={index}>
                                                    {address.name}
                                                    {address.quartier && `, ${address.quartier}`}
                                                    {address.city && `, ${address.city}`}
                                                    {address.state && `, ${address.state}`}
                                                    {address.zip && `, ${address.zip}`}
                                                </option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p>Free</p>
                        {coupon && <p>{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='flex justify-center gap-3 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                            <button className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all'>Apply</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>{currency}{coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toLocaleString()}</p>
            </div>
            <button
                onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'Placing order...', success: 'Order placed!', error: 'Failed to place order' })}
                disabled={loading || !selectedAddress || items.length === 0}
                className={`w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all ${(loading || !selectedAddress || items.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Placing Order...' : 'Place Order'}
            </button>

            {showAddressModal && (
                <AddressModal
                    setShowAddressModal={setShowAddressModal}
                    onAddressAdded={async () => {
                        // Refresh addresses after adding new one
                        if (user) {
                            try {
                                const res = await fetch(`/api/addresses?userId=${user.id}`);
                                if (res.ok) {
                                    const data = await res.json();
                                    dispatch(setAddresses(data));
                                }
                            } catch (err) {
                                console.error("Failed to refresh addresses:", err);
                            }
                        }
                    }}
                />
            )}

        </div>
    )
}

export default OrderSummary