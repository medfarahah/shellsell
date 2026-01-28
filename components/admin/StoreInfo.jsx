'use client'
import Image from "next/image"
import { MapPin, Mail, Phone } from "lucide-react"

const StoreInfo = ({store}) => {
    // Default placeholder image (data URI for a simple gray circle)
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Ccircle cx='18' cy='18' r='18' fill='%23e5e7eb'/%3E%3Ctext x='18' y='24' font-size='18' text-anchor='middle' fill='%239ca3af'%3E%3F%3C/text%3E%3C/svg%3E";
    const defaultLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='60' font-size='40' text-anchor='middle' fill='%239ca3af'%3E%3F%3C/text%3E%3C/svg%3E";
    
    const userImage = store.user?.image && store.user.image.trim() !== '' ? store.user.image : defaultAvatar;
    const storeLogo = store.logo && store.logo.trim() !== '' ? store.logo : defaultLogo;
    
    return (
        <div className="flex-1 space-y-2 text-sm">
            <Image width={100} height={100} src={storeLogo} alt={store.name} className="max-w-20 max-h-20 object-contain shadow rounded-full max-sm:mx-auto" />
            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <h3 className="text-xl font-semibold text-slate-800"> {store.name} </h3>
                <span className="text-sm">@{store.username}</span>

                {/* Status Badge */}
                <span
                    className={`text-xs font-semibold px-4 py-1 rounded-full ${store.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : store.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                        }`}
                >
                    {store.status}
                </span>
            </div>

            <p className="text-slate-600 my-5 max-w-2xl">{store.description}</p>
            <p className="flex items-center gap-2"> <MapPin size={16} /> {store.address}</p>
            <p className="flex items-center gap-2"><Phone size={16} /> {store.contact}</p>
            <p className="flex items-center gap-2"><Mail size={16} />  {store.email}</p>
            <p className="text-slate-700 mt-5">Applied  on <span className="text-xs">{new Date(store.createdAt).toLocaleDateString()}</span> by</p>
            <div className="flex items-center gap-2 text-sm ">
                <Image width={36} height={36} src={userImage} alt={store.user?.name || 'User'} className="w-9 h-9 rounded-full" />
                <div>
                    <p className="text-slate-600 font-medium">{store.user?.name || 'Unknown'}</p>
                    <p className="text-slate-400">{store.user?.email || ''}</p>
                </div>
            </div>
        </div>
    )
}

export default StoreInfo