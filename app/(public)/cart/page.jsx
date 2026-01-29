'use client'
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart, updateCartItem } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    
    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);

    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const createCartArray = () => {
        setTotalPrice(0);
        const cartArray = [];
        for (const [key, value] of Object.entries(cartItems)) {
            const product = products.find(product => product.id === key);
            if (product) {
                // Handle both old format (number) and new format (object)
                const quantity = typeof value === 'number' ? value : (value?.quantity || 0);
                const color = typeof value === 'object' ? value.color : null;
                const size = typeof value === 'object' ? value.size : null;
                
                cartArray.push({
                    ...product,
                    quantity,
                    selectedColor: color,
                    selectedSize: size,
                });
                setTotalPrice(prev => prev + product.price * quantity);
            }
        }
        setCartArray(cartArray);
    }

    const handleColorChange = (productId, newColor) => {
        dispatch(updateCartItem({ productId, color: newColor || null }));
    }

    const handleSizeChange = (productId, newSize) => {
        dispatch(updateCartItem({ productId, size: newSize || null }));
    }

    const handleDeleteItemFromCart = (productId) => {
        dispatch(deleteItemFromCart({ productId }))
    }

    useEffect(() => {
        if (products.length > 0) {
            createCartArray();
        }
    }, [cartItems, products]);

    return cartArray.length > 0 ? (
        <div className="min-h-screen mx-6 text-slate-800">

            <div className="max-w-7xl mx-auto ">
                {/* Title */}
                <PageTitle heading="My Cart" text="items in your cart" linkText="Add more" />

                <div className="flex items-start justify-between gap-5 max-lg:flex-col">

                    <table className="w-full max-w-4xl text-slate-600 table-auto">
                        <thead>
                            <tr className="max-sm:text-sm">
                                <th className="text-left">Product</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th className="max-md:hidden">Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                cartArray.map((item, index) => (
                                    <tr key={index} className="space-x-2">
                                        <td className="flex gap-3 my-4">
                                            {item.images && item.images.length > 0 && (
                                                <div className="flex gap-3 items-center justify-center bg-slate-100 size-18 rounded-md">
                                                    <Image src={item.images[0]} className="h-14 w-auto" alt={item.name} width={45} height={45} />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="max-sm:text-sm">{item.name}</p>
                                                <p className="text-xs text-slate-500">{item.category}</p>
                                                <p>{currency}{item.price}</p>
                                                
                                                {/* Color Selection */}
                                                {item.color && (
                                                    <div className="mt-2">
                                                        <label className="text-xs text-slate-600 font-medium">Color:</label>
                                                        <input
                                                            type="text"
                                                            value={item.selectedColor || ''}
                                                            onChange={(e) => handleColorChange(item.id, e.target.value)}
                                                            placeholder="Enter color"
                                                            className="w-full max-w-[120px] mt-1 p-1.5 px-2 text-xs outline-none border border-slate-200 rounded"
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* Size Selection */}
                                                {item.sizes && item.sizes.length > 0 && (
                                                    <div className="mt-2">
                                                        <label className="text-xs text-slate-600 font-medium">Size:</label>
                                                        <select
                                                            value={item.selectedSize || ''}
                                                            onChange={(e) => handleSizeChange(item.id, e.target.value)}
                                                            className="w-full max-w-[120px] mt-1 p-1.5 px-2 text-xs outline-none border border-slate-200 rounded"
                                                        >
                                                            <option value="">Select size</option>
                                                            {item.sizes.map((s, idx) => (
                                                                <option key={idx} value={s}>
                                                                    {s}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <Counter productId={item.id} color={item.selectedColor} size={item.selectedSize} />
                                        </td>
                                        <td className="text-center">{currency}{(item.price * item.quantity).toLocaleString()}</td>
                                        <td className="text-center max-md:hidden">
                                            <button onClick={() => handleDeleteItemFromCart(item.id)} className=" text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all">
                                                <Trash2Icon size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    <OrderSummary totalPrice={totalPrice} items={cartArray} />
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
            <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
        </div>
    )
}