"use client"

import { useState } from "react"
import Link from "next/link"
import { updateOrderStatus } from "@/app/actions/order-actions"
import { ArrowRight, CheckCircle, Package, Truck, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import StatusDropdown from "@/app/dashboard/orders/components/StatusDropdown"

interface Order {
    id: number
    party: { name: string }
    itemCategory: string
    quantity: number
    weight: number
    deliveryDate: Date
    status: string
    partyOrderNo: string | null
    karigarId: string
}

export default function ManufacturerOrderList({ orders, type }: { orders: Order[], type: 'pending' | 'completed' }) {
    const router = useRouter()
    const [loadingIds, setLoadingIds] = useState<number[]>([])

    const handleReceive = async (orderId: number) => {
        if (!confirm("Confirm receipt of this order?")) return

        setLoadingIds(prev => [...prev, orderId])
        try {
            await updateOrderStatus(orderId, "RECEIVED")
            // Revalidation happens on server, but we might want local updates or wait
            router.refresh()
        } catch (error) {
            alert("Failed to update status")
        } finally {
            setLoadingIds(prev => prev.filter(id => id !== orderId))
        }
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-xs font-bold text-gray-400">#{order.id.toString().padStart(4, '0')}</span>
                            <h3 className="text-lg font-bold text-gray-800">{order.itemCategory}</h3>
                        </div>
                        <StatusDropdown orderId={order.id} currentStatus={order.status} isAdmin={false} assignedKarigarId={order.karigarId} />
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mb-4">
                        <div>
                            <span className="block text-xs text-gray-400">Party</span>
                            <span className="font-medium">{order.party.name}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400">Delivery</span>
                            <span className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400">Weight (Est)</span>
                            <span>{order.weight} g</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400">Qty</span>
                            <span>{order.quantity} pcs</span>
                        </div>
                    </div>

                    <div className="pt-3 border-t flex gap-3">
                        {type === 'pending' && (
                            <>
                                {order.status === "ISSUED" && (
                                    <button
                                        onClick={() => handleReceive(order.id)}
                                        disabled={loadingIds.includes(order.id)}
                                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2"
                                    >
                                        {loadingIds.includes(order.id) ? "Processing..." : (
                                            <>
                                                <Truck size={16} /> Accept & Receive
                                            </>
                                        )}
                                    </button>
                                )}
                                {order.status === "RECEIVED" && (
                                    <Link
                                        href={`/manufacturer/orders/${order.id}/complete`}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} /> Complete Order
                                    </Link>
                                )}
                            </>
                        )}

                        <Link
                            href={`/manufacturer/orders/${order.id}`}
                            className={`flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 ${type === 'completed' ? 'w-full' : ''}`}
                        >
                            <Info size={16} /> View Details
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    )
}
