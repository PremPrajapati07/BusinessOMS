import { Sidebar } from "./components/Sidebar"
import { MobileNav } from "./components/MobileNav"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    if (session.user.role !== "ADMIN") {
        redirect("/manufacturer/dashboard")
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile Navigation */}
            <MobileNav />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64">
                {/* Header */}
                <header className="bg-white shadow-sm h-16 flex items-center px-4 lg:px-8">
                    {/* Spacer for mobile menu button */}
                    <div className="w-10 lg:w-0"></div>
                    <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Manufacturing Management</h2>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
