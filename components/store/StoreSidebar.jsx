'use client'

import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon } from "lucide-react"
import Link from "next/link"

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
                <Link href="/" className="relative text-3xl font-semibold text-slate-700">
                    <span className="text-green-600">As</span>sal<span className="text-green-600 text-4xl leading-0">.</span>
                    <p className="absolute text-[10px] font-semibold -top-1 -right-7 px-2 p-0.5 rounded-full flex items-center gap-1 text-white bg-green-500">
                        plus
                    </p>
                </Link>
                <p className="text-slate-600 text-sm">
                    {storeInfo?.name ? `Seller: ${storeInfo.name}` : 'Assal Seller Dashboard'}
                </p>
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