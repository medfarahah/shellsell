'use client'
import { XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useUser } from "@clerk/nextjs"
import { useDispatch } from "react-redux"
import { addAddress } from "@/lib/features/address/addressSlice"

const AddressModal = ({ setShowAddressModal, onAddressAdded }) => {
    const { user } = useUser()
    const dispatch = useDispatch()

    const [address, setAddress] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        quartier: '',
        street: '', // Optional/Hidden if not needed
        city: '', // Optional/Hidden
        state: '', // Optional/Hidden
        zip: '', // Optional/Hidden
        country: '', // Optional/Hidden
    })

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!user) {
            toast.error("Please sign in to add an address")
            return
        }

        // Validate required fields
        if (!address.name.trim() || !address.email.trim() || !address.phone.trim()) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            const res = await fetch("/api/addresses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user.id,
                    name: address.name.trim(),
                    email: address.email.trim(),
                    phone: address.phone.trim(),
                    whatsapp: address.whatsapp.trim() || null,
                    quartier: address.quartier.trim() || null,
                    street: address.street.trim() || null,
                    city: address.city.trim() || null,
                    state: address.state.trim() || null,
                    zip: address.zip.trim() || null,
                    country: address.country.trim() || null,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to add address")
            }

            // Add to Redux state
            dispatch(addAddress(data))
            
            // Callback to refresh addresses in parent component
            if (onAddressAdded) {
                onAddressAdded();
            }
            
            toast.success("Address added successfully!")
            setShowAddressModal(false)
            
            // Reset form
            setAddress({
                name: '',
                email: '',
                phone: '',
                whatsapp: '',
                quartier: '',
                street: '',
                city: '',
                state: '',
                zip: '',
                country: '',
            })
        } catch (err) {
            console.error("Address creation error:", err)
            toast.error(err.message || "Failed to add address")
        }
    }

    return (
        <form onSubmit={e => toast.promise(handleSubmit(e), { loading: 'Adding Address...' })} className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center">
            <div className="flex flex-col gap-5 text-slate-700 w-full max-w-sm mx-6 bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Add Address</h2>
                    <XIcon size={24} className="text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setShowAddressModal(false)} />
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                        <input name="name" onChange={handleAddressChange} value={address.name} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors" type="text" placeholder="John Doe" required />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                        <input name="email" onChange={handleAddressChange} value={address.email} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors" type="email" placeholder="john@example.com" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Phone Number</label>
                            <input name="phone" onChange={handleAddressChange} value={address.phone} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors" type="text" placeholder="+1 234..." required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">WhatsApp</label>
                            <input name="whatsapp" onChange={handleAddressChange} value={address.whatsapp} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors" type="text" placeholder="+1 234..." required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Quartier (Neighborhood)</label>
                        <input name="quartier" onChange={handleAddressChange} value={address.quartier} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors" type="text" placeholder="Downtown" required />
                    </div>
                </div>

                <button className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all mt-2">SAVE DETAILS</button>
            </div>
        </form>
    )
}

export default AddressModal