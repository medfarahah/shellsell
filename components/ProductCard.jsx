'use client'

import { StarIcon, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlist } from '@/lib/features/wishlist/wishlistSlice'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import { trackProductClick } from '@/lib/tracking/behaviorTracker'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const dispatch = useDispatch()
    const { user } = useUser()
    const wishlistItems = useSelector(state => state.wishlist.items)
    const isWishlisted = wishlistItems.some(item => item.id === product.id)

    // calculate the average rating of the product
    const ratings = product.rating || [];
    const rating = ratings.length > 0 
        ? Math.round(ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length)
        : 0;

    // Calculate vendor rating from store's products
    const calculateVendorRating = () => {
        if (!product.store) return 0;
        
        // If store has products with ratings, calculate average
        const storeProducts = product.store.Product || [];
        const allRatings = storeProducts.flatMap(p => p.rating || []);
        
        if (allRatings.length === 0) return 0;
        
        const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
        return Math.round(avgRating * 10) / 10; // Round to 1 decimal
    };

    const vendorRating = calculateVendorRating();
    const vendorName = product.store?.name || 'Unknown Vendor';

    // Track product click
    const handleProductClick = () => {
        trackProductClick(product);
    };

    const handleWishlistClick = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!user) {
            toast.error('Please sign in to use wishlist')
            return
        }

        // Update local Redux state immediately for snappy UI
        dispatch(toggleWishlist(product))

        // Persist to database (fire and forget)
        try {
            await fetch('/api/wishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    userName: user.fullName || user.username || user.id,
                    userEmail: user.primaryEmailAddress?.emailAddress || "",
                    userImage: user.imageUrl || "",
                    product,
                }),
            })
        } catch (err) {
            console.error('Failed to sync wishlist to server', err)
        }
    }

    return (
        <Link 
            href={`/product/${product.id}`} 
            className='group max-xl:mx-auto relative'
            onClick={handleProductClick}
        >
            <button
                onClick={handleWishlistClick}
                className="absolute z-10 right-2 top-2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white transition"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
                <Heart
                    size={18}
                    className={isWishlisted ? "text-red-500 fill-red-500" : "text-slate-400"}
                />
            </button>

            <div className='bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center'>
                <Image
                    width={500}
                    height={500}
                    className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300'
                    src={product.images[0]}
                    alt={product.name || ''}
                />
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div>
                    <p>{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon
                                key={index}
                                size={14}
                                className='text-transparent mt-0.5'
                                fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"}
                            />
                        ))}
                    </div>
                </div>
                <p>{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard