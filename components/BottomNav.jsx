'use client';
import { Home, ShoppingBag, ShoppingCart, User, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";

const BottomNav = () => {
    const pathname = usePathname();
    const cartCount = useSelector((state) => state.cart.total);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

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

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Shop", href: "/shop", icon: ShoppingBag },
        { name: "Cart", href: "/cart", icon: ShoppingCart, count: cartCount },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:hidden">
            <div className="grid grid-cols-4 h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                                isActive
                                    ? "text-indigo-600"
                                    : "text-slate-500 hover:text-indigo-600"
                            }`}
                        >
                            <div className="relative">
                                <item.icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {item.name === "Cart" && item.count > 0 && (
                                    <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-indigo-600 rounded-full border-2 border-white">
                                        {item.count}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}

                {/* Mobile Login / Account */}
                <div className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-indigo-600">
                                <User size={24} />
                                <span className="text-[10px] font-medium">
                                    Login
                                </span>
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <div className="flex flex-col items-center justify-center space-y-1 w-full h-full">
                            <UserButton 
                                appearance={{
                                    elements: {
                                        avatarBox: "w-6 h-6",
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
                            <span className="text-[10px] font-medium">Account</span>
                        </div>
                    </SignedIn>
                </div>
            </div>
        </div>
    );
};

export default BottomNav;
