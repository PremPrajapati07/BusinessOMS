"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertTriangle, Plus, Trash2 } from "lucide-react"

export default function CompletionForm({ order }: { order: any }) {
    const router = useRouter()
    const issuedMaterial = order.materialIssued || {}
    const issuedWeight = issuedMaterial.weight || 0
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        usedWeight: issuedWeight.toString() || "",
        wastage: "0",
        finalColor: issuedMaterial.goldColor || "Yellow",
        remarks: ""
    })

    const [diamondEntries, setDiamondEntries] = useState(
        issuedMaterial.diamondEntries?.length > 0
            ? issuedMaterial.diamondEntries.map((d: any) => ({
                shape: d.shape || "Round",
                sizeMM: (d.sizeMM || d.sieveSize || "").toString(),
                usedPieces: d.pieces ?? 0,
                finalWeight: d.weight ?? 0.0
            }))
            : [{ shape: "Round", sizeMM: "", usedPieces: 0, finalWeight: 0.0 }]
    )

    const usedWeight = parseFloat(formData.usedWeight) || 0
    const wastage = parseFloat(formData.wastage) || 0
    const goldBalance = issuedWeight - (usedWeight + wastage)

    const issuedDiamonds = order.materialIssued?.diamondEntries || []

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm("Are you sure you want to complete this order? This action cannot be undone.")) return

        setLoading(true)
        try {
            const res = await fetch(`/api/orders/${order.id}/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    diamondEntries
                })
            })

            if (res.ok) {
                router.push("/manufacturer/dashboard")
                router.refresh()
            } else {
                alert("Failed to submit completion data")
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ring-1 ring-black/5">
            <div className="bg-white px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Order Completion Details</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Material Consumption Report</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-bold border border-gray-100">
                        Order #{order.id}
                    </span>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Gold Tracking Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">1. Gold Consumption</h4>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">ISSUED: {issuedWeight}g</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Used Gold Weight (gm) *</label>
                            <input
                                type="number" step="0.01"
                                value={formData.usedWeight}
                                onChange={e => setFormData({ ...formData, usedWeight: e.target.value })}
                                className="block w-full p-3 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all font-mono font-bold"
                                required
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Wastage / Loss (gm) *</label>
                            <input
                                type="number" step="0.001"
                                value={formData.wastage}
                                onChange={e => setFormData({ ...formData, wastage: e.target.value })}
                                className="block w-full p-3 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-red-50 focus:border-red-500 transition-all font-mono font-bold"
                                required
                                placeholder="0.000"
                            />
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border-2 flex justify-between items-center transition-colors ${goldBalance < 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Current Balance Return</p>
                            <p className="text-xs text-gray-500 font-medium">Issued - (Used + Wastage)</p>
                        </div>
                        <div className="text-right">
                            <span className={`text-2xl font-mono font-black ${goldBalance < 0 ? 'text-red-600' : 'text-green-700'}`}>
                                {goldBalance.toFixed(3)}g
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Final Color *</label>
                            <select
                                value={formData.finalColor}
                                onChange={e => setFormData({ ...formData, finalColor: e.target.value })}
                                className="block w-full p-3 border-2 border-gray-100 rounded-xl font-bold"
                            >
                                <option value="Yellow">Yellow</option>
                                <option value="Rose">Rose</option>
                                <option value="White">White</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Diamond Tracking Section */}
                <div className="space-y-4 pt-6 border-t border-gray-50">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">2. Diamond Consumption</h4>
                    </div>

                    {/* Issued Diamonds Summary */}
                    {issuedDiamonds.length > 0 && (
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Issued for this order:</p>
                            <div className="space-y-1">
                                {issuedDiamonds.map((d: any, i: number) => (
                                    <div key={i} className="flex justify-between text-xs font-bold text-indigo-900">
                                        <span>{d.shape} {d.sizeMM || d.sieveSize}</span>
                                        <span>{d.pieces} Pcs / {d.weight} Ct</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-2 border-gray-50 rounded-xl overflow-hidden shadow-inner">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase">
                                <tr>
                                    <th className="p-3">Diamond Specs</th>
                                    <th className="p-3">Pcs Used</th>
                                    <th className="p-3">Wt Used (Ct)</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {diamondEntries.map((row: any, idx: number) => (
                                    <tr key={idx} className="bg-white">
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <select value={row.shape} onChange={(e) => {
                                                    const newD = [...diamondEntries]; newD[idx].shape = e.target.value; setDiamondEntries(newD)
                                                }} className="p-1 border rounded text-[10px] font-bold">
                                                    <option value="Round">Round</option>
                                                    <option value="Princess">Princess</option>
                                                    <option value="Marquise">Marquise</option>
                                                </select>
                                                <input type="text" placeholder="Size" value={row.sizeMM} onChange={(e) => {
                                                    const newD = [...diamondEntries]; (newD[idx] as any).sizeMM = e.target.value; setDiamondEntries(newD)
                                                }} className="w-16 p-1 border rounded text-[10px] font-bold" />
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <input type="number" value={row.usedPieces} onChange={(e) => { const newD = [...diamondEntries]; newD[idx].usedPieces = Number(e.target.value); setDiamondEntries(newD) }} className="w-16 p-1 border rounded font-mono font-bold" />
                                        </td>
                                        <td className="p-3">
                                            <input type="number" step="0.01" value={row.finalWeight} onChange={(e) => { const newD = [...diamondEntries]; newD[idx].finalWeight = Number(e.target.value); setDiamondEntries(newD) }} className="w-20 p-1 border rounded font-mono font-bold text-green-600" />
                                        </td>
                                        <td className="p-3">
                                            <button type="button" onClick={() => setDiamondEntries(diamondEntries.filter((_: any, i: number) => i !== idx))} className="p-1 hover:bg-red-50 text-red-400 rounded transition-colors"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button type="button" onClick={() => setDiamondEntries([...diamondEntries, { shape: 'Round', sizeMM: '', usedPieces: 0, finalWeight: 0 }])} className="w-full p-3 bg-gray-50 text-[10px] text-indigo-600 font-black uppercase hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 border-t border-gray-50">
                            <Plus size={14} /> Add Diamond Consumption Entry
                        </button>
                    </div>
                </div>

                {/* Remarks */}
                <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">3. Closing Remarks</label>
                    <textarea
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                        className="block w-full p-4 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-sm font-medium"
                        placeholder="Any special notes about this completion..."
                    ></textarea>
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                        {loading ? "Completing Order..." : (
                            <>
                                <CheckCircle size={24} /> Finalize & Submit Order
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    )
}
