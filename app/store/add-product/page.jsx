'use client'
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function StoreAddProduct() {
    const { user } = useUser()
    const router = useRouter()

    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
        color: "",
        sizeType: "",       // 'letter' or 'number'
        sizesInput: "",     // raw input, e.g. "S,M,L" or "38,40,42"
    })
    const [loading, setLoading] = useState(false)
    const [generatingDescription, setGeneratingDescription] = useState(false)
    const [storeId, setStoreId] = useState(null)

    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
        })
    }

    const fetchStore = async () => {
        if (!user) return
        try {
            const res = await fetch(`/api/stores?userId=${user.id}`)
            if (!res.ok) throw new Error("Failed to load store")
            const stores = await res.json()
            const store = stores[0]
            if (store) {
                setStoreId(store.id)
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchStore()
    }, [user])

    const onChangeHandler = (e) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
        setProductInfo({ ...productInfo, [e.target.name]: value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        
        if (!user) {
            toast.error("Please sign in to add products")
            return
        }

        if (!storeId) {
            toast.error("Store not found. Please create a store first.")
            return
        }

        // Validate required fields
        if (!productInfo.name.trim()) {
            toast.error("Please enter a product name")
            return
        }
        if (!productInfo.description.trim()) {
            toast.error("Please enter a product description (you can use the AI button to generate one)")
            return
        }
        if (!productInfo.category) {
            toast.error("Please select a category")
            return
        }
        if (productInfo.mrp <= 0 || productInfo.price <= 0) {
            toast.error("Please enter valid prices")
            return
        }
        if (productInfo.price > productInfo.mrp) {
            toast.error("Offer price cannot be greater than MRP")
            return
        }

        // Basic validation for sizes if provided
        if (productInfo.sizesInput.trim() && !productInfo.sizeType) {
            toast.error("Please select a size type (letter or number)")
            return
        }

        // Check if at least one image is uploaded
        const imageFiles = Object.values(images).filter(img => img !== null)
        if (imageFiles.length === 0) {
            toast.error("Please upload at least one product image")
            return
        }

        setLoading(true)

        try {
            // Convert images to base64
            const imagePromises = imageFiles.map(file => convertImageToBase64(file))
            const base64Images = await Promise.all(imagePromises)

            // Parse sizes input into an array
            const sizesArray = productInfo.sizesInput
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)

            const res = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: productInfo.name.trim(),
                    description: productInfo.description.trim(),
                    mrp: parseFloat(productInfo.mrp),
                    price: parseFloat(productInfo.price),
                    images: base64Images,
                    category: productInfo.category,
                    storeId: storeId,
                    inStock: true,
                    color: productInfo.color.trim() || undefined,
                    sizeType: productInfo.sizeType || undefined,
                    sizes: sizesArray.length ? sizesArray : undefined,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to create product")
            }

            toast.success("Product added successfully!")
            
            // Reset form
            setProductInfo({
                name: "",
                description: "",
                mrp: 0,
                price: 0,
                category: "",
                color: "",
                sizeType: "",
                sizesInput: "",
            })
            setImages({ 1: null, 2: null, 3: null, 4: null })
            
            // Redirect to manage products page
            router.push("/store/manage-product")
        } catch (err) {
            console.error("Product creation error:", err)
            toast.error(err.message || "Failed to add product")
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateDescription = async () => {
        if (!productInfo.name.trim()) {
            toast.error("Please enter a product name first")
            return
        }

        try {
            setGeneratingDescription(true)

            const res = await fetch("/api/ai/generate-description", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: productInfo.name.trim(),
                    category: productInfo.category || undefined,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate description")
            }

            setProductInfo(prev => ({
                ...prev,
                description: data.description,
            }))

            toast.success("AI description generated")
        } catch (err) {
            console.error("AI description error:", err)
            toast.error(err.message || "Failed to generate description")
        } finally {
            setGeneratingDescription(false)
        }
    }


    return (
        <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })} className="text-slate-500 mb-28">
            <h1 className="text-2xl">Add New <span className="text-slate-800 font-medium">Products</span></h1>
            <p className="mt-7">Product Images</p>

            <div htmlFor="" className="flex gap-3 mt-4">
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image width={300} height={300} className='h-15 w-auto border border-slate-200 rounded cursor-pointer' src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} alt="" />
                        <input type="file" accept='image/*' id={`images${key}`} onChange={e => setImages({ ...images, [key]: e.target.files[0] })} hidden />
                    </label>
                ))}
            </div>

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Name
                <input
                    type="text"
                    name="name"
                    onChange={onChangeHandler}
                    value={productInfo.name}
                    placeholder="Enter product name"
                    className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded"
                    required
                />
            </label>

            <div className="flex flex-col gap-2 my-6 max-w-sm">
                <div className="flex items-center justify-between">
                    <label className="flex flex-col gap-1">
                        <span>Description</span>
                    </label>
                    <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={generatingDescription}
                        className="text-xs px-3 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {generatingDescription ? "Generating..." : "Generate with AI"}
                    </button>
                </div>
                <textarea
                    name="description"
                    onChange={onChangeHandler}
                    value={productInfo.description}
                    placeholder="Enter product description or use AI"
                    rows={5}
                    className="w-full p-2 px-4 outline-none border border-slate-200 rounded resize-none"
                    required
                />
            </div>

            <div className="flex gap-5">
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Actual Price ($)
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" rows={5} className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Offer Price ($)
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" rows={5} className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
            </div>

            <select
                onChange={e => setProductInfo({ ...productInfo, category: e.target.value })}
                value={productInfo.category}
                className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded"
                required
            >
                <option value="">Select a category</option>
                {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>

            {/* Color */}
            <label htmlFor="" className="flex flex-col gap-2 my-4 max-w-sm">
                Color (optional)
                <input
                    type="text"
                    name="color"
                    onChange={onChangeHandler}
                    value={productInfo.color}
                    placeholder="e.g. Black, Red"
                    className="w-full p-2 px-4 outline-none border border-slate-200 rounded"
                />
            </label>

            {/* Sizes */}
            <div className="flex flex-col gap-2 my-4 max-w-sm">
                <span className="text-sm font-medium text-slate-700">Sizes (optional)</span>
                <div className="flex items-center gap-4 mb-2">
                    <label className="flex items-center gap-1 text-sm">
                        <input
                            type="radio"
                            name="sizeType"
                            value="letter"
                            checked={productInfo.sizeType === 'letter'}
                            onChange={onChangeHandler}
                        />
                        <span>Letter (e.g. S, M, L)</span>
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                        <input
                            type="radio"
                            name="sizeType"
                            value="number"
                            checked={productInfo.sizeType === 'number'}
                            onChange={onChangeHandler}
                        />
                        <span>Number (e.g. 38, 40, 42)</span>
                    </label>
                </div>
                <input
                    type="text"
                    name="sizesInput"
                    onChange={onChangeHandler}
                    value={productInfo.sizesInput}
                    placeholder={productInfo.sizeType === 'number' ? "38, 40, 42" : "S, M, L"}
                    className="w-full p-2 px-4 outline-none border border-slate-200 rounded"
                />
            </div>

            <br />

            <button disabled={loading} className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition">Add Product</button>
        </form>
    )
}