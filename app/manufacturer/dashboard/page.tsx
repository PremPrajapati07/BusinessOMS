import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ManufacturerOrderList from "../components/ManufacturerOrderList"
import { Package, Scale, Gem, CheckCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ManufacturerDashboard() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "MANUFACTURER" || !session.user.karigarId) {
        if (session?.user.role === "ADMIN") return redirect("/dashboard")
        return redirect("/login")
    }

    // Fetch Karigar Ledger for personal analysis
    const ledger = await prisma.karigarLedger.findUnique({
        where: { karigarId: session.user.karigarId }
    })

    const orders = await prisma.order.findMany({
        where: {
            karigarId: session.user.karigarId
        },
        orderBy: {
            deliveryDate: 'asc'
        },
        include: {
            party: true
        }
    })

    const pendingOrders = orders.filter(o => o.status !== "COMPLETED")
    const completedOrders = orders.filter(o => o.status === "COMPLETED")

    const goldBalance = (ledger?.totalGoldIssued || 0) - (ledger?.totalGoldUsed || 0) - (ledger?.totalWastage || 0)
    const diaPcsBalance = (ledger?.totalDiamondPcsIssued || 0) - (ledger?.totalDiamondPcsUsed || 0)
    const diaWtBalance = (ledger?.totalDiamondWtIssued || 0) - (ledger?.totalDiamondWtUsed || 0)

    return (
        <div className="space-y-8 pb-20">
            {/* Personal Analysis Section */}
            <div className="space-y-4">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">My Material Balance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-amber-200/50 group-hover:scale-110 transition-transform">
                            <Scale size={80} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Current Gold Balance</p>
                            <h3 className="text-3xl font-black text-amber-900 font-mono tracking-tighter">
                                {goldBalance.toFixed(3)}<span className="text-sm ml-1 text-amber-700">g</span>
                            </h3>
                            <div className="mt-4 flex gap-4 text-[10px] font-bold text-amber-700/60 uppercase">
                                <span>Issued: {(ledger?.totalGoldIssued || 0).toFixed(2)}g</span>
                                <span>Used: {(ledger?.totalGoldUsed || 0).toFixed(2)}g</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-indigo-200/50 group-hover:scale-110 transition-transform">
                            <Gem size={80} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Diamond Pcs Balance</p>
                            <h3 className="text-3xl font-black text-indigo-900 font-mono tracking-tighter">
                                {diaPcsBalance}<span className="text-sm ml-1 text-indigo-700">PCS</span>
                            </h3>
                            <div className="mt-4 flex gap-4 text-[10px] font-bold text-indigo-700/60 uppercase">
                                <span>Issued: {ledger?.totalDiamondPcsIssued || 0}</span>
                                <span>Used: {ledger?.totalDiamondPcsUsed || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-emerald-200/50 group-hover:scale-110 transition-transform">
                            <CheckCircle size={80} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Diamond Weight Balance</p>
                            <h3 className="text-3xl font-black text-emerald-900 font-mono tracking-tighter">
                                {diaWtBalance.toFixed(3)}<span className="text-sm ml-1 text-emerald-700">ct</span>
                            </h3>
                            <div className="mt-4 flex gap-4 text-[10px] font-bold text-emerald-700/60 uppercase">
                                <span>Issued: {(ledger?.totalDiamondWtIssued || 0).toFixed(2)}ct</span>
                                <span>Used: {(ledger?.totalDiamondWtUsed || 0).toFixed(2)}ct</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Orders</h2>
                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {pendingOrders.length} Pending
                    </div>
                </div>

                {pendingOrders.length === 0 && completedOrders.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-gray-500">No orders assigned to you yet.</p>
                    </div>
                )}

                {pendingOrders.length > 0 && (
                    <ManufacturerOrderList orders={pendingOrders} type="pending" />
                )}

                {completedOrders.length > 0 && (
                    <div className="pt-6 border-t">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Completed History</h2>
                        <ManufacturerOrderList orders={completedOrders} type="completed" />
                    </div>
                )}
            </div>
        </div>
    )
}
