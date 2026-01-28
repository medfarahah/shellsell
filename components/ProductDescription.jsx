'use client'
import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {

    const [selectedTab, setSelectedTab] = useState('Description')

    return (
        <div className="my-18 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} key={index} onClick={() => setSelectedTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <p className="max-w-xl">{product.description}</p>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-14">
                    {product.rating && product.rating.length > 0 ? (
                        product.rating.map((item, index) => {
                            const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ctext x='20' y='26' font-size='16' text-anchor='middle' fill='%239ca3af'%3E%3F%3C/text%3E%3C/svg%3E";
                            const userImage = item.user?.image && item.user.image.trim() !== '' 
                                ? item.user.image 
                                : defaultAvatar;
                            
                            return (
                                <div key={item.id || index} className="flex gap-5 mb-10">
                                    <Image src={userImage} alt={item.user?.name || 'User'} className="size-10 rounded-full" width={40} height={40} />
                                    <div>
                                        <div className="flex items-center" >
                                            {Array(5).fill('').map((_, idx) => (
                                                <StarIcon key={idx} size={18} className='text-transparent mt-0.5' fill={item.rating >= idx + 1 ? "#00C950" : "#D1D5DB"} />
                                            ))}
                                        </div>
                                        <p className="text-sm max-w-lg my-4">{item.review}</p>
                                        <p className="font-medium text-slate-800">{item.user?.name || 'Anonymous'}</p>
                                        <p className="mt-3 font-light">{new Date(item.createdAt).toDateString()}</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-slate-400">No reviews yet. Be the first to review this product!</p>
                    )}
                </div>
            )}

            {/* Store Page */}
            {product.store && (
                <div className="flex gap-3 mt-14">
                    {product.store.logo && (
                        <Image 
                            src={product.store.logo} 
                            alt={product.store.name || 'Store'} 
                            className="size-11 rounded-full ring ring-slate-400" 
                            width={44} 
                            height={44} 
                        />
                    )}
                    <div>
                        <p className="font-medium text-slate-600">Product by {product.store.name}</p>
                        {product.store.username && (
                            <Link href={`/shop/${product.store.username}`} className="flex items-center gap-1.5 text-green-500"> view store <ArrowRight size={14} /></Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDescription