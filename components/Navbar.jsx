'use client'
import { Search, ShoppingCart, User, Package, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";

const Navbar = () => {

    const router = useRouter();
    const pathname = usePathname();
    const { user } = useUser();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">As</span>sal<span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/about">About</Link>
                        <Link href="/contact">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                                    Login
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton 
                                appearance={{
                                    elements: {
                                        avatarBox: "w-8 h-8",
                                        userButtonPopoverCard: "shadow-lg",
                                    }
                                }}
                                afterSignOutUrl="/"
                            >
                                <UserButton.MenuItems>
                                    <UserButton.Link
                                        label="My Orders"
                                        labelIcon={<Package size={16} />}
                                        href="/orders"
                                    />
                                    <UserButton.Link
                                        label="My Account"
                                        labelIcon={<User size={16} />}
                                        href="/account"
                                    />
                                </UserButton.MenuItems>
                            </UserButton>
                        </SignedIn>

                    </div>

                    {/* Mobile User Button - Hidden as we have BottomNav now */}
                    {/* <div className="sm:hidden">
                        <button className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                            Login
                        </button>
                    </div> */}
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar