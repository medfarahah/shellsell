'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";

const ProductDetails = ({ product }) => {

    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    const router = useRouter()

    const [mainImage, setMainImage] = useState(product.images[0]);
    const [selectedColor, setSelectedColor] = useState(product.color || '');
    const [selectedSize, setSelectedSize] = useState('');

    const addToCartHandler = () => {
        dispatch(addToCart({ 
            productId, 
            color: selectedColor || null, 
            size: selectedSize || null 
        }))
    }

    const ratings = product.rating || [];
    const averageRating = ratings.length > 0 
        ? ratings.reduce((acc, item) => acc + item.rating, 0) / ratings.length 
        : 0;
    
    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {product.images && product.images.length > 0 && product.images.map((image, index) => (
                        <div key={index} onClick={() => setMainImage(product.images[index])} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer">
                            <Image src={image} className="group-hover:scale-103 group-active:scale-95 transition" alt="" width={45} height={45} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg ">
                    {mainImage && <Image src={mainImage} alt={product.name} width={250} height={250} />}
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{ratings.length} Reviews</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {currency}{product.price} </p>
                    <p className="text-xl text-slate-500 line-through">{currency}{product.mrp}</p>
                </div>

                {/* Color & Size Selection */}
                {(product.color || (product.sizes && product.sizes.length > 0)) && (
                    <div className="flex flex-col gap-4 text-sm text-slate-600 mb-4">
                        {product.color && (
                            <div className="flex flex-col gap-2">
                                <span className="font-medium text-slate-800">Color:</span>
                                <input
                                    type="text"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    placeholder="Enter color"
                                    className="w-full max-w-xs p-2 px-4 outline-none border border-slate-200 rounded"
                                />
                            </div>
                        )}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <span className="font-medium text-slate-800">Size:</span>
                                <select
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    className="w-full max-w-xs p-2 px-4 outline-none border border-slate-200 rounded"
                                >
                                    <option value="">Select a size</option>
                                    {product.sizes.map((s, idx) => (
                                        <option key={idx} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}
                <div className="flex items-center gap-2 text-slate-500">
                    <TagIcon size={14} />
                    <p>Save {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% right now</p>
                </div>
                <div className="flex items-end gap-5 mt-10">
                    {
                        cart[productId] && (
                            <div className="flex flex-col gap-3">
                                <p className="text-lg text-slate-800 font-semibold">Quantity</p>
                                <Counter productId={productId} color={selectedColor} size={selectedSize} />
                            </div>
                        )
                    }
                    <button onClick={() => {
                        const cartItem = cart[productId];
                        const isInCart = cartItem && (typeof cartItem === 'number' ? cartItem > 0 : cartItem.quantity > 0);
                        if (!isInCart) {
                            addToCartHandler();
                        } else {
                            router.push('/cart');
                        }
                    }} className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition">
                        {(() => {
                            const cartItem = cart[productId];
                            const isInCart = cartItem && (typeof cartItem === 'number' ? cartItem > 0 : cartItem.quantity > 0);
                            return !isInCart ? 'Add to Cart' : 'View Cart';
                        })()}
                    </button>
                </div>
                {/* Display selected color and size if item is in cart */}
                {(() => {
                    const cartItem = cart[productId];
                    if (!cartItem) return null;
                    const color = typeof cartItem === 'object' ? cartItem.color : null;
                    const size = typeof cartItem === 'object' ? cartItem.size : null;
                    if (!color && !size) return null;
                    return (
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mt-2">
                            {color && (
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">Selected Color:</span>
                                    <span>{color}</span>
                                </div>
                            )}
                            {size && (
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">Selected Size:</span>
                                    <span>{size}</span>
                                </div>
                            )}
                        </div>
                    );
                })()}
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> Free shipping worldwide </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" /> 100% Secured Payment </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Trusted by top brands </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails