import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Scale, Package, CheckCircle, Clock, AlertTriangle, Gem, TrendingUp } from "lucide-react"
import { resyncKarigarLedger } from "@/lib/ledger"

export const dynamic = 'force-dynamic'

async function getKarigarLedger(id: string) {
    const karigar = await prisma.karigar.findUnique({
        where: { id },
        include: {
            orders: {
                include: {
                    party: true,
                    materialIssued: { include: { diamondEntries: true } },
                    materialUsed: { include: { diamondEntries: true } }
                },
                orderBy: { createdAt: 'desc' }
            },
            ledger: true
        }
    })
    return karigar
}

export default async function KarigarLedgerPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return redirect("/login")

    const { id } = await params

    // Self-heal: Recalculate ledger from existing orders before viewing
    await resyncKarigarLedger(id)

    const karigar = await getKarigarLedger(id)

    if (!karigar) return notFound()

    // Calculated Stats
    const totalOrders = karigar.orders.length
    const completedOrders = karigar.orders.filter(o => o.status === "COMPLETED")
    const lateOrders = completedOrders.filter(o => {
        const deliveryDate = new Date(o.deliveryDate)
        const completedDate = o.actualDeliveryDate ? new Date(o.actualDeliveryDate) : new Date(o.updatedAt)
        return completedDate > deliveryDate
    })

    const totalIssued = karigar.ledger?.totalGoldIssued || 0
    const totalUsed = (karigar.ledger?.totalGoldUsed || 0) + (karigar.ledger?.totalWastage || 0)
    const balance = totalIssued - totalUsed

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/karigars" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{karigar.name}</h1>
                        <p className="text-sm text-gray-500 font-medium">Performance Ledger & Material Accounting</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        Karigar ID: {karigar.id.slice(-6).toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Gold Balance" value={`${balance.toFixed(2)}g`} icon={Scale} color={balance > 1 ? "red" : "indigo"} subtitle="Outstanding Weight" />
                <StatCard title="Completion Rate" value={`${Math.round((completedOrders.length / (totalOrders || 1)) * 100)}%`} icon={CheckCircle} color="green" subtitle={`${completedOrders.length} of ${totalOrders} tasks`} />
                <StatCard title="Delivery Performance" value={lateOrders.length > 0 ? `${lateOrders.length} Late` : "100% On-Time"} icon={Clock} color={lateOrders.length > 0 ? "orange" : "blue"} subtitle="Total Delayed Orders" />
                <StatCard title="Total Tasks" value={totalOrders} icon={Package} color="purple" subtitle="All assigned orders" />
            </div>

            {/* Detailed Accounting & Orders Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Material Summary */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <TrendingUp size={16} /> Material Summary
                        </h3>
                        <div className="space-y-4">
                            <SummaryItem label="Total Issued" value={`${totalIssued.toFixed(2)} g`} color="text-gray-900" />
                            <SummaryItem label="Total Used" value={`${(karigar.ledger?.totalGoldUsed || 0).toFixed(2)} g`} color="text-green-600" />
                            <SummaryItem label="Total Wastage" value={`${(karigar.ledger?.totalWastage || 0).toFixed(2)} g`} color="text-red-500" />
                            <div className="pt-4 border-t border-dashed flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-900">Current Balance</span>
                                <span className={`text-lg font-black ${balance > 1 ? 'text-red-600' : 'text-indigo-600'}`}>{balance.toFixed(3)} g</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Gem size={16} /> Diamond Ledger
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-indigo-300 uppercase font-bold">Issued</p>
                                <p className="text-xl font-black">{karigar.ledger?.totalDiamondPcsIssued || 0} <span className="text-[10px] font-normal">PCS</span></p>
                            </div>
                            <div>
                                <p className="text-[10px] text-indigo-300 uppercase font-bold">Returned</p>
                                <p className="text-xl font-black">{karigar.ledger?.totalDiamondPcsUsed || 0} <span className="text-[10px] font-normal">PCS</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Recent Order History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b">
                                <tr>
                                    <th className="px-6 py-4">Order Details</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Delivery Performance</th>
                                    <th className="px-6 py-4 text-right">Gold Diff</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {karigar.orders.map(order => {
                                    const isLate = order.status === "COMPLETED" && new Date(order.updatedAt) > new Date(order.deliveryDate)
                                    const diff = (order.materialIssued?.weight || 0) - ((order.materialUsed?.usedWeight || 0) + (order.materialUsed?.wastage || 0))

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={`/dashboard/orders/${order.id}`} className="font-bold text-gray-900 hover:text-indigo-600">
                                                    #{order.id.toString().padStart(4, '0')} - {order.party.name}
                                                </Link>
                                                <p className="text-[10px] text-gray-500 uppercase">{order.itemCategory} | {new Date(order.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                                                    order.status === "RECEIVED" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.status === "COMPLETED" ? (
                                                    <div className="flex items-center gap-1.5">
                                                        {isLate ? (
                                                            <><AlertTriangle size={14} className="text-orange-500" /> <span className="text-xs text-orange-600 font-medium">Late by {Math.ceil((new Date(order.updatedAt).getTime() - new Date(order.deliveryDate).getTime()) / (1000 * 60 * 60 * 24))} days</span></>
                                                        ) : (
                                                            <><CheckCircle size={14} className="text-green-500" /> <span className="text-xs text-green-600 font-medium">On-time</span></>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Due: {new Date(order.deliveryDate).toLocaleDateString()}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-xs">
                                                {diff !== 0 ? (
                                                    <span className={diff > 0.01 ? "text-red-500" : "text-green-600"}>
                                                        {diff > 0 ? "+" : ""}{diff.toFixed(2)}g
                                                    </span>
                                                ) : "-"}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {karigar.orders.length === 0 && (
                            <div className="p-12 text-center">
                                <Package size={40} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium">No orders found for this karigar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, subtitle }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        green: "text-green-600 bg-green-50 border-green-100",
        orange: "text-orange-600 bg-orange-50 border-orange-100",
        red: "text-red-600 bg-red-50 border-red-100",
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
        purple: "text-purple-600 bg-purple-50 border-purple-100",
    }
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between group hover:border-indigo-100 transition-all">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <p className={`text-2xl font-black ${colors[color].split(' ')[0]}`}>{value}</p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">{subtitle}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${colors[color]}`}>
                <Icon size={20} />
            </div>
        </div>
    )
}

function SummaryItem({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 font-medium">{label}</span>
            <span className={`text-sm font-bold ${color}`}>{value}</span>
        </div>
    )
}
