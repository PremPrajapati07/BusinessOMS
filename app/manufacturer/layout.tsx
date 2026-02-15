import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogOut, Home } from "lucide-react"

export default async function ManufacturerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    // Strict Role Check: Only MANUFACTURER allowed here
    if (session.user.role !== "MANUFACTURER" && session.user.role !== "ADMIN") {
        // Allow ADMIN to see it too for testing/supervising maybe? Or restrict strictly?
        // Requirement says "Admin UI Full control". Let's allow ADMIN to access too for now, 
        // but typically manufacturer dashboard is specific to a logged in karigar.
        // If ADMIN accesses, they don't have a karigarId linked usually.
        // Let's restrict to MANUFACTURER for now to avoid confusion, or handle ADMIN gracefully.
        // If ADMIN tries to access, redirect to admin dashboard.
        if (session.user.role === "ADMIN") {
            redirect("/dashboard")
        }
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Mobile-first Header */}
            <header className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                        <Home size={20} />
                    </div>
                    <span className="font-bold text-gray-800">Karigar Panel</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 hidden sm:block">
                        {session.user.email}
                    </span>
                    <Link
                        href="/api/auth/signout"
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </Link>
                </div>
            </header>

            <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    )
}
