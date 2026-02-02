'use client'
import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import ProductCard from '../../components/ProductCard'
import Loading from '../../components/Loading'

const BestSellingPage = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products')
                if (!res.ok) throw new Error('Failed to load products')
                const data = await res.json()
                // Sort by rating count (popularity)
                const sortedData = data.sort((a, b) => (b.rating?.length || 0) - (a.rating?.length || 0))
                setProducts(sortedData)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    if (loading) return <div className='my-20'><Loading /></div>

    return (
        <div className='px-6 my-20 max-w-6xl mx-auto'>
            <Title title='Best Selling' description={`Browse our top ${products.length} best-selling products.`} showLink={false} />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                {products.map((product, index) => (
                    <ProductCard key={product.id || index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSellingPage
