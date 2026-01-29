'use client'

import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const StoreSidebar = ({storeInfo}) => {

    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/store', icon: HomeIcon },
        { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
        { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
        { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-2 justify-center items-center pt-8 max-sm:hidden">
                {storeInfo?.logo && (
                    <div className="mb-2">
                        <Image
                            src={storeInfo.logo}
                            alt={storeInfo.name || 'Store Logo'}
                            className="size-20 sm:size-24 object-cover border-2 border-slate-200 rounded-full shadow-sm"
                            width={96}
                            height={96}
                        />
                    </div>
                )}
                <p className="text-slate-600 text-sm text-center px-2">
                    {storeInfo?.name ? storeInfo.name : 'Assal Seller Dashboard'}
                </p>
                {storeInfo?.username && (
                    <p className="text-xs text-slate-400">@{storeInfo.username}</p>
                )}
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href && 'bg-slate-100 sm:text-slate-600'}`}
                        >
                            <link.icon size={18} className="sm:ml-5" />
                            <p className="max-sm:hidden">{link.name}</p>
                            {pathname === link.href && (
                                <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>
                            )}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default StoreSidebar