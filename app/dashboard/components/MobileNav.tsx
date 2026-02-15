"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    const navItems = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/dashboard/orders", label: "Orders" },
        { href: "/dashboard/parties", label: "Parties" },
        { href: "/dashboard/karigars", label: "Karigars" },
    ]

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === href
        }
        return pathname.startsWith(href)
    }

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#28365b] text-white rounded-lg shadow-lg"
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-out Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-[#28365b] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
                    aria-label="Close menu"
                >
                    <X size={24} />
                </button>

                {/* Logo/Title */}
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Vaama OMS</h2>
                    <p className="text-sm text-gray-300 mt-1">Manufacturing</p>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                                ? "bg-white text-[#28365b]"
                                : "text-white hover:bg-white/10"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <Link
                        href="/api/auth/signout"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-center text-sm text-white hover:bg-white/10 rounded-lg"
                    >
                        Sign Out
                    </Link>
                </div>
            </div>
        </>
    )
}
