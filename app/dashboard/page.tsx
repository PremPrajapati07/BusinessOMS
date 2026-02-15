import { prisma } from "@/lib/prisma"
import { Package, Users, Palette, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
export const dynamic = 'force-dynamic'

async function getStats() {
    const orderCount = await prisma.order.count()
    const partyCount = await prisma.party.count()
    const karigarCount = await prisma.karigar.count()
    const pendingOrders = await prisma.order.count({ where: { status: "ISSUED" } })

    // Weight Stats
    const orders = await prisma.order.findMany({
        select: { status: true, weight: true }
    })

    const issuedWeight = orders.filter(o => o.status === "ISSUED").reduce((sum, o) => sum + (Number(o.weight) || 0), 0)
    const receivedWeight = orders.filter(o => o.status === "RECEIVED").reduce((sum, o) => sum + (Number(o.weight) || 0), 0)
    const completedWeight = orders.filter(o => o.status === "COMPLETED").reduce((sum, o) => sum + (Number(o.weight) || 0), 0)

    // Karigar Performance
    const karigarData = await prisma.karigar.findMany({
        include: {
            orders: {
                include: {
                    materialIssued: true,
                    materialUsed: true
                }
            }
        }
    })

    const performance = karigarData.map(k => {
        const assigned = k.orders.reduce((sum, o) => sum + (o.materialIssued?.weight || 0), 0)
        const used = k.orders.reduce((sum, o) => sum + (o.materialUsed?.usedWeight || 0), 0)
        return {
            id: k.id,
            name: k.name,
            assigned,
            used,
            totalOrders: k.orders.length,
            completedOrders: k.orders.filter(o => o.status === "COMPLETED").length
        }
    })

    return {
        orderCount, partyCount, karigarCount, pendingOrders,
        issuedWeight, receivedWeight, completedWeight,
        performance
    }
}

export default async function DashboardPage() {
    const stats = await getStats()

    return (
        <div className="space-y-6 lg:space-y-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>

            {/* Top Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <Link href="/dashboard/orders">
                    <StatCard title="Total Orders" value={stats.orderCount} icon={Package} color="blue" />
                </Link>
                <Link href="/dashboard/orders?status=ISSUED">
                    <StatCard title="In Issue (Orders)" value={stats.pendingOrders} icon={Clock} color="orange" />
                </Link>
                <Link href="/dashboard/parties">
                    <StatCard title="Active Parties" value={stats.partyCount} icon={Users} color="green" />
                </Link>
                <Link href="/dashboard/karigars">
                    <StatCard title="Karigars" value={stats.karigarCount} icon={Palette} color="purple" />
                </Link>
            </div>

            {/* Material Weight Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <WeightCard title="Total Issued" weight={stats.issuedWeight} color="orange" icon={AlertCircle} />
                <WeightCard title="Total Received" weight={stats.receivedWeight} color="blue" icon={Clock} />
                <WeightCard title="Total Completed" weight={stats.completedWeight} color="green" icon={CheckCircle} />
            </div>

            {/* Action Card: Detailed Analytics */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-bold text-gray-900">Karigar Performance & Ledgers</h3>
                    <p className="text-gray-500 max-w-md">View detailed material accounting, delivery performance, and workload analysis for each karigar.</p>
                </div>
                <Link
                    href="/dashboard/analytics"
                    className="whitespace-nowrap px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                    View Detailed Analytics
                </Link>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color }: any) {
    const colors: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        green: "bg-green-50 text-green-600 border-green-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
    }
    return (
        <div className={`bg-white p-4 lg:p-6 rounded-xl shadow-sm border ${colors[color]} transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">{title}</p>
                    <p className="text-2xl font-black text-gray-900">{value}</p>
                </div>
                <div className={`p-2 lg:p-3 rounded-xl ${colors[color]}`}>
                    <Icon size={20} className="lg:w-6 lg:h-6" />
                </div>
            </div>
        </div>
    )
}

function WeightCard({ title, weight, color, icon: Icon }: any) {
    const colors: Record<string, string> = {
        blue: "text-blue-600 border-l-blue-500",
        orange: "text-orange-600 border-l-orange-500",
        green: "text-green-600 border-l-green-500",
    }
    return (
        <div className={`bg-white p-5 rounded-xl border border-gray-100 border-l-4 ${colors[color]} shadow-sm`}>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
                    <p className="text-xl font-bold text-gray-900">{weight.toFixed(2)} <span className="text-xs font-normal text-gray-400">gm</span></p>
                </div>
                <Icon size={24} className="opacity-20" />
            </div>
        </div>
    )
}
