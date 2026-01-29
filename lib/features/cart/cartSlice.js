import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId, color, size } = action.payload
            if (state.cartItems[productId]) {
                // If item exists, increment quantity
                state.cartItems[productId].quantity++
            } else {
                // If new item, create with quantity 1 and optional color/size
                state.cartItems[productId] = {
                    quantity: 1,
                    color: color || null,
                    size: size || null,
                }
            }
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId].quantity--
                if (state.cartItems[productId].quantity === 0) {
                    delete state.cartItems[productId]
                }
            }
            state.total -= 1
        },
        updateCartItem: (state, action) => {
            const { productId, color, size } = action.payload
            if (state.cartItems[productId]) {
                if (color !== undefined) state.cartItems[productId].color = color
                if (size !== undefined) state.cartItems[productId].size = size
            }
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.total -= state.cartItems[productId].quantity
                delete state.cartItems[productId]
            }
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    }
})

export const { addToCart, removeFromCart, updateCartItem, clearCart, deleteItemFromCart } = cartSlice.actions

export default cartSlice.reducer
