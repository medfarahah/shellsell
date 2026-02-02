'use client'
import React, { useEffect } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useDispatch, useSelector } from 'react-redux'
import { setProduct } from '../lib/features/product/productSlice'

const LatestProducts = () => {

    const displayQuantity = 4
    const dispatch = useDispatch()
    const products = useSelector(state => state.product.list)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products')
                if (!res.ok) throw new Error('Failed to load products')
                const data = await res.json()
                dispatch(setProduct(data))
            } catch (err) {
                console.error(err)
            }
        }

        if (products.length === 0) {
            fetchProducts()
        }
    }, [dispatch, products.length])

    const visibleCount = products.length < displayQuantity ? products.length : displayQuantity

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Latest Products' description={`Showing ${visibleCount} of ${products.length} products`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                {products
                    .slice()
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, displayQuantity)
                    .map((product, index) => (
                        <ProductCard key={product.id || index} product={product} />
                    ))}
            </div>
        </div>
    )
}

export default LatestProducts