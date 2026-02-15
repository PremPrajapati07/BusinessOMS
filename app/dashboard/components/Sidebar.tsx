"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, Users, Palette, LogOut, PlusCircle, BarChart3 } from "lucide-react"
import { signOut } from "next-auth/react"
import clsx from "clsx"

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Create Order", href: "/dashboard/orders/new", icon: PlusCircle },
    { name: "Orders", href: "/dashboard/orders", icon: Package },
    { name: "Parties", href: "/dashboard/parties", icon: Users },
    { name: "Karigars", href: "/dashboard/karigars", icon: Palette },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col w-64 bg-slate-900 text-white h-screen fixed">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold tracking-wider">Vaama OMS</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                                pathname === item.href
                                    ? "bg-indigo-600 text-white shadow-lg"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:bg-red-900/20 hover:text-red-400 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    )
}
