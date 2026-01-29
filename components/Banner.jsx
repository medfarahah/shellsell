'use client'
import React from 'react'
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Banner() {

    const [isOpen, setIsOpen] = React.useState(true);
    const [coupons, setCoupons] = React.useState([]);
    const [currentCouponIndex, setCurrentCouponIndex] = React.useState(0);
    const router = useRouter();

    // Load all available public coupons from the database
    React.useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await fetch('/api/coupons?onlyPublic=true');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setCoupons(data);
                    }
                }
            } catch (err) {
                console.error('Failed to load coupons', err);
            }
        };

        fetchCoupons();
    }, []);

    // Rotate through coupons every 5 seconds if multiple coupons exist
    React.useEffect(() => {
        if (coupons.length > 1) {
            const interval = setInterval(() => {
                setCurrentCouponIndex((prev) => (prev + 1) % coupons.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [coupons]);

    const handleClaim = () => {
        if (coupons.length === 0) {
            toast.error('No coupons available right now');
            return;
        }

        setIsOpen(false);

        const currentCoupon = coupons[currentCouponIndex];
        const code = currentCoupon.code;
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(code).catch(() => { });
        }

        toast.success(`Coupon ${code.toUpperCase()} copied! Apply it in your cart.`);
        router.push('/cart');
    };

    const currentCoupon = coupons[currentCouponIndex] || null;

    // Always show banner section, display available coupons
    return isOpen && (
        <div className="w-full px-6 py-1 font-medium text-sm text-white text-center bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A]">
            <div className='flex items-center justify-between max-w-7xl  mx-auto'>
                <div className="flex items-center gap-2 flex-1">
                    {currentCoupon ? (
                        <>
                            <p>
                                Get {currentCoupon.discount}% OFF with code&nbsp;
                                <span className="font-semibold">{currentCoupon.code.toUpperCase()}</span>!
                                {currentCoupon.description && (
                                    <span className="ml-2 text-xs opacity-90">- {currentCoupon.description}</span>
                                )}
                            </p>
                            {coupons.length > 1 && (
                                <div className="flex gap-1 ml-4">
                                    {coupons.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentCouponIndex(index)}
                                            className={`w-2 h-2 rounded-full transition-all ${
                                                index === currentCouponIndex ? 'bg-white' : 'bg-white/50'
                                            }`}
                                            aria-label={`View coupon ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <p>Get 20% OFF on Your First Order!</p>
                    )}
                </div>
                <div className="flex items-center space-x-6">
                    {currentCoupon && (
                        <button
                            onClick={handleClaim}
                            type="button"
                            className="font-normal text-gray-800 bg-white px-7 py-2 rounded-full max-sm:hidden hover:bg-gray-100 transition"
                        >
                            Claim Offer
                        </button>
                    )}
                    <button
                        onClick={() => setIsOpen(false)}
                        type="button"
                        className="font-normal text-gray-800 py-2 rounded-full hover:opacity-80 transition"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect y="12.532" width="17.498" height="2.1" rx="1.05" transform="rotate(-45.74 0 12.532)" fill="#fff" />
                            <rect x="12.533" y="13.915" width="17.498" height="2.1" rx="1.05" transform="rotate(-135.74 12.533 13.915)" fill="#fff" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};