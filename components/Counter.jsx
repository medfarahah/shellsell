'use client'
import { addToCart, removeFromCart } from "../lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";

const Counter = ({ productId, color, size }) => {

    const { cartItems } = useSelector(state => state.cart);

    const dispatch = useDispatch();

    const cartItem = cartItems[productId];
    const quantity = cartItem?.quantity || (typeof cartItem === 'number' ? cartItem : 0);

    const addToCartHandler = () => {
        dispatch(addToCart({
            productId,
            color: color || cartItem?.color || null,
            size: size || cartItem?.size || null
        }))
    }

    const removeFromCartHandler = () => {
        dispatch(removeFromCart({ productId }))
    }

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button onClick={removeFromCartHandler} className="p-1 select-none">-</button>
            <p className="p-1">{quantity}</p>
            <button onClick={addToCartHandler} className="p-1 select-none">+</button>
        </div>
    )
}

export default Counter