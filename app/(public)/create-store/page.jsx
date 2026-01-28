'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function CreateStore() {
    const { user, isLoaded } = useUser()
    const router = useRouter()

    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: ""
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
        })
    }

    const fetchSellerStatus = async () => {
        if (!isLoaded || !user) {
            setLoading(false)
            return
        }

        try {
            const res = await fetch(`/api/stores?userId=${user.id}`)
            if (!res.ok) throw new Error("Failed to check store status")
            const stores = await res.json()
            
            if (stores.length > 0) {
                const store = stores[0]
                setAlreadySubmitted(true)
                setStatus(store.status)
                setMessage(
                    store.status === "approved"
                        ? "Your store has been approved! You can now manage your products."
                        : store.status === "rejected"
                        ? "Your store application was rejected. Please contact support for more information."
                        : "Your store application is pending approval. We'll notify you once it's reviewed."
                )
                if (store.status === "approved") {
                    setTimeout(() => {
                        router.push("/store")
                    }, 5000)
                }
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        
        if (!user) {
            toast.error("Please sign in to create a store")
            return
        }

        if (!storeInfo.image) {
            toast.error("Please upload a store logo")
            return
        }

        // Validate form fields
        if (!storeInfo.name.trim()) {
            toast.error("Please enter a store name")
            return
        }
        if (!storeInfo.username.trim()) {
            toast.error("Please enter a username")
            return
        }
        if (!storeInfo.description.trim()) {
            toast.error("Please enter a description")
            return
        }
        if (!storeInfo.email.trim()) {
            toast.error("Please enter an email")
            return
        }
        if (!storeInfo.contact.trim()) {
            toast.error("Please enter a contact number")
            return
        }
        if (!storeInfo.address.trim()) {
            toast.error("Please enter an address")
            return
        }

        try {
            // Convert image to base64
            const logoBase64 = await convertImageToBase64(storeInfo.image)

            const res = await fetch("/api/stores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user.id,
                    name: storeInfo.name.trim(),
                    username: storeInfo.username.trim(),
                    description: storeInfo.description.trim(),
                    email: storeInfo.email.trim(),
                    contact: storeInfo.contact.trim(),
                    address: storeInfo.address.trim(),
                    logo: logoBase64,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to create store")
            }

            toast.success("Store created successfully! Waiting for admin approval.")
            setAlreadySubmitted(true)
            setStatus("pending")
            setMessage("Your store application has been submitted. We'll review it and notify you once it's approved.")
        } catch (err) {
            console.error("Store creation error:", err)
            toast.error(err.message || "Failed to create store")
        }
    }

    useEffect(() => {
        if (isLoaded) {
            fetchSellerStatus()
        }
    }, [isLoaded, user])

    if (!isLoaded) {
        return <Loading />
    }

    if (!user) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <p className="text-2xl font-semibold text-slate-500">Please sign in to create a store</p>
            </div>
        )
    }

    return !loading ? (
        <>
            {!alreadySubmitted ? (
                <div className="mx-6 min-h-[70vh] my-16">
                    <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Submitting data..." })} className="max-w-7xl mx-auto flex flex-col items-start gap-3 text-slate-500">
                        {/* Title */}
                        <div>
                            <h1 className="text-3xl ">Add Your <span className="text-slate-800 font-medium">Store</span></h1>
                            <p className="max-w-lg">To become a seller on GoCart, submit your store details for review. Your store will be activated after admin verification.</p>
                        </div>

                        <label className="mt-10 cursor-pointer">
                            Store Logo
                            <Image src={storeInfo.image ? URL.createObjectURL(storeInfo.image) : assets.upload_area} className="rounded-lg mt-2 h-16 w-auto" alt="" width={150} height={100} />
                            <input type="file" accept="image/*" onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files[0] })} hidden />
                        </label>

                        <p>Username</p>
                        <input name="username" onChange={onChangeHandler} value={storeInfo.username} type="text" placeholder="Enter your store username" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Name</p>
                        <input name="name" onChange={onChangeHandler} value={storeInfo.name} type="text" placeholder="Enter your store name" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Description</p>
                        <textarea name="description" onChange={onChangeHandler} value={storeInfo.description} rows={5} placeholder="Enter your store description" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" />

                        <p>Email</p>
                        <input name="email" onChange={onChangeHandler} value={storeInfo.email} type="email" placeholder="Enter your store email" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Contact Number</p>
                        <input name="contact" onChange={onChangeHandler} value={storeInfo.contact} type="text" placeholder="Enter your store contact number" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Address</p>
                        <textarea name="address" onChange={onChangeHandler} value={storeInfo.address} rows={5} placeholder="Enter your store address" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" />

                        <button className="bg-slate-800 text-white px-12 py-2 rounded mt-10 mb-40 active:scale-95 hover:bg-slate-900 transition ">Submit</button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center">
                    <p className="sm:text-2xl lg:text-3xl mx-5 font-semibold text-slate-500 text-center max-w-2xl">{message}</p>
                    {status === "approved" && <p className="mt-5 text-slate-400">redirecting to dashboard in <span className="font-semibold">5 seconds</span></p>}
                </div>
            )}
        </>
    ) : (<Loading />)
}