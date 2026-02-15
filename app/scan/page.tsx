"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { QrCode, CheckCircle, AlertCircle, Lock, User } from "lucide-react"

function ScanContent() {
    const { data: session, status: authStatus } = useSession()
    const searchParams = useSearchParams()
    const router = useRouter()
    const orderId = searchParams.get("orderId")

    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState("")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (orderId) {
            fetch(`/api/orders/${orderId}`)
                .then(res => res.json())
                .then(data => {
                    setOrder(data)
                    setSelectedStatus(data.status)
                    setLoading(false)
                })
                .catch(() => {
                    setMessage("Order not found")
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [orderId])

    const handleStatusUpdate = async () => {
        if (!orderId || !selectedStatus) return

        if (selectedStatus === "COMPLETED") {
            router.push(`/manufacturer/orders/${orderId}/complete`)
            return
        }

        setUpdating(true)
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: selectedStatus })
            })

            if (res.ok) {
                setMessage("Status updated successfully!")
                setTimeout(() => {
                    router.push(`/dashboard/orders/${orderId}`)
                }, 1500)
            } else {
                const errorData = await res.json()
                setMessage(errorData.error || "Failed to update status")
            }
        } catch (err) {
            setMessage("Error updating status")
        } finally {
            setUpdating(false)
        }
    }

    if (authStatus === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Verifying identity...</p>
                </div>
            </div>
        )
    }

    if (authStatus === "unauthenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
                    <Lock className="mx-auto h-16 w-16 text-indigo-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
                    <p className="text-gray-600 mb-6">You must be logged in to update order statuses.</p>
                    <button
                        onClick={() => signIn()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <User size={20} />
                        Login to Continue
                    </button>
                </div>
            </div>
        )
    }

    if (!orderId || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
                    <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                    <p className="text-gray-600 mb-6">The QR code you scanned is invalid or the order does not exist.</p>
                    <button
                        onClick={() => router.push("/dashboard/orders")}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold"
                    >
                        Go to Orders
                    </button>
                </div>
            </div>
        )
    }

    const isAdmin = session?.user?.role === "ADMIN"
    const isAssignedKarigar = session?.user?.role === "MANUFACTURER" && session?.user?.karigarId === order.karigarId
    const canUpdate = isAdmin || isAssignedKarigar

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto space-y-6 py-8">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="bg-indigo-600 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <QrCode size={32} />
                                <div>
                                    <h1 className="text-2xl font-bold">Order Verification</h1>
                                    <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">OE{String(order.id).padStart(4, '0')}</p>
                                </div>
                            </div>
                            {!canUpdate && (
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Lock size={20} className="text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CAD Download Option */}
                    {order.cadFileContent && (
                        <div className="bg-indigo-50 px-6 py-4 flex items-center justify-between border-b border-indigo-100">
                            <div className="flex items-center gap-2 text-indigo-800">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="M9 15l3 3 3-3" /></svg>
                                <span className="font-bold text-sm">CAD File Available</span>
                            </div>
                            <button
                                onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = order.cadFileContent;
                                    link.download = order.cadFileUrl || `Order_${order.id}_CAD.3dm`; // Default extension if missing
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Download
                            </button>
                        </div>
                    )}

                    <div className="p-6 space-y-6">
                        {/* Assignment Warning */}
                        {!canUpdate && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3">
                                <AlertCircle className="text-red-500 shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-bold text-red-800">Permission Denied</p>
                                    <p className="text-xs text-red-600 mt-1">
                                        This order is assigned to <strong>{order.karigar?.name}</strong>. You do not have permission to update its status.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Order Info */}
                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-50">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Party</p>
                                <p className="font-bold text-gray-900">{order.party?.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Karigar Assigned</p>
                                <p className="font-bold text-gray-900">{order.karigar?.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Item Category</p>
                                <p className="font-bold text-gray-900">{order.itemCategory}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current Status</p>
                                <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    order.status === 'RECEIVED' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        {/* Status Update */}
                        {canUpdate && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                    Update Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="block w-full p-4 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all font-bold"
                                >
                                    <option value="ISSUED">ISSUED</option>
                                    <option value="RECEIVED">RECEIVED</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                </select>
                            </div>
                        )}

                        {/* Message */}
                        {message && (
                            <div className={`p-4 rounded-xl flex items-center gap-2 border shadow-sm ${message.includes("success") ? "bg-green-50 text-green-800 border-green-100" : "bg-red-50 text-red-800 border-red-100"}`}>
                                {message.includes("success") ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                <span className="font-bold text-sm">{message}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-4">
                            {canUpdate && (
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={updating || selectedStatus === order.status}
                                    className="w-full px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100"
                                >
                                    {updating ? "Updating..." : selectedStatus === "COMPLETED" ? "Review and Complete" : "Update Status"}
                                </button>
                            )}
                            <button
                                onClick={() => router.push(isAdmin ? `/dashboard/orders/${orderId}` : `/manufacturer/orders/${orderId}`)}
                                className="w-full px-6 py-4 border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                            >
                                View Order Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ScanPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <ScanContent />
        </Suspense>
    )
}
