import { prisma } from "@/lib/prisma"
import { BarChart3, TrendingUp, AlertTriangle, Package, Gem } from "lucide-react"

// No local prisma client instantiation
export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    // Fetch Karigar Ledgers with Karigar details
    const ledgers = await prisma.karigarLedger.findMany({
        include: {
            karigar: true
        },
        orderBy: {
            totalGoldIssued: 'desc'
        }
    })

    // Calculate Summary Stats
    const totalGoldIssued = ledgers.reduce((sum, l) => sum + l.totalGoldIssued, 0)
    const totalGoldUsed = ledgers.reduce((sum, l) => sum + l.totalGoldUsed, 0)
    const totalWastage = ledgers.reduce((sum, l) => sum + l.totalWastage, 0)
    const totalBalance = totalGoldIssued - (totalGoldUsed + totalWastage)

    const totalDiamondPcsIssued = ledgers.reduce((sum, l) => sum + l.totalDiamondPcsIssued, 0)
    const totalDiamondWtIssued = ledgers.reduce((sum, l) => sum + l.totalDiamondWtIssued, 0)
    const totalDiamondPcsUsed = ledgers.reduce((sum, l) => sum + l.totalDiamondPcsUsed, 0)
    const totalDiamondWtUsed = ledgers.reduce((sum, l) => sum + l.totalDiamondWtUsed, 0)

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" />
                Manufacturing Analytics
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 ring-1 ring-black/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Total Gold Issued</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalGoldIssued.toFixed(2)} g</h3>
                            <p className="text-[10px] text-gray-400 mt-1 font-bold italic">Outstanding: {totalBalance.toFixed(2)}g</p>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package size={20} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 ring-1 ring-black/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Total Gold Used</p>
                            <h3 className="text-2xl font-black text-green-700 mt-1">{totalGoldUsed.toFixed(2)} g</h3>
                            <p className="text-[10px] text-gray-400 mt-1 font-bold italic">Process Loss: {totalWastage.toFixed(2)}g</p>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 ring-1 ring-black/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Diamond Balance</p>
                            <h3 className="text-2xl font-black text-indigo-600 mt-1">{totalDiamondWtIssued.toFixed(2)} ct</h3>
                            <p className="text-[10px] text-gray-400 mt-1 font-bold italic">{totalDiamondPcsIssued} Pieces Issued</p>
                        </div>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Gem size={20} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 ring-1 ring-black/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Diamond Used</p>
                            <h3 className="text-2xl font-black text-purple-600 mt-1">{totalDiamondWtUsed.toFixed(2)} ct</h3>
                            <p className="text-[10px] text-gray-400 mt-1 font-bold italic">{totalDiamondPcsUsed} Pieces Consumed</p>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={20} /></div>
                    </div>
                </div>
            </div>

            {/* Karigar Ledger Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ring-1 ring-black/5">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800">Karigar Accounts (Gold & Diamond Ledger)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Karigar</th>
                                <th className="px-6 py-4 text-right bg-yellow-50/50">Gold Issued</th>
                                <th className="px-6 py-4 text-right">Gold Used</th>
                                <th className="px-6 py-4 text-right">Wastage</th>
                                <th className="px-6 py-4 text-right text-indigo-600">G. Balance</th>
                                <th className="px-6 py-4 text-right bg-blue-50/50">Dia Issued</th>
                                <th className="px-6 py-4 text-right">Dia Used</th>
                                <th className="px-6 py-4 text-right text-indigo-600">D. Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ledgers.map((ledger) => {
                                const goldBalance = ledger.totalGoldIssued - (ledger.totalGoldUsed + ledger.totalWastage)
                                const diaPcsBalance = ledger.totalDiamondPcsIssued - ledger.totalDiamondPcsUsed
                                const diaWtBalance = ledger.totalDiamondWtIssued - ledger.totalDiamondWtUsed

                                return (
                                    <tr key={ledger.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{ledger.karigar.name}</td>
                                        <td className="px-6 py-4 text-right font-mono bg-yellow-50/30">{ledger.totalGoldIssued.toFixed(3)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-green-600">{ledger.totalGoldUsed.toFixed(3)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-red-500">{ledger.totalWastage.toFixed(3)}</td>
                                        <td className={`px-6 py-4 text-right font-mono font-bold ${goldBalance < 0 ? 'text-red-600' : 'text-indigo-600'}`}>
                                            {goldBalance.toFixed(3)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono bg-blue-50/30">
                                            <div className="flex flex-col">
                                                <span>{ledger.totalDiamondWtIssued.toFixed(2)} ct</span>
                                                <span className="text-[10px] text-gray-400">{ledger.totalDiamondPcsIssued} pcs</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-purple-600">
                                            <div className="flex flex-col">
                                                <span>{ledger.totalDiamondWtUsed.toFixed(2)} ct</span>
                                                <span className="text-[10px] text-gray-400">{ledger.totalDiamondPcsUsed} pcs</span>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-mono font-bold ${diaWtBalance < 0 ? 'text-red-600' : 'text-indigo-600'}`}>
                                            <div className="flex flex-col">
                                                <span>{diaWtBalance.toFixed(2)} ct</span>
                                                <span className="text-[10px] text-gray-400">{diaPcsBalance} pcs</span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {ledgers.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium italic">No ledger data available yet. Complete orders to generate accounts.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function CheckCircle({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}
