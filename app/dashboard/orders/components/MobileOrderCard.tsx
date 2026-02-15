"use client"

import Link from "next/link"
import StatusDropdown from "./StatusDropdown"
import DeleteOrderButton from "./DeleteOrderButton"

export default function MobileOrderCard({ order }: { order: any }) {
    return (
        <div className="relative">
            <Link
                href={`/dashboard/orders/${order.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <p className="text-sm font-bold text-gray-900">OE{String(order.id).padStart(4, '0')}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.itemCategory}</p>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                        <StatusDropdown orderId={order.id} currentStatus={order.status} isAdmin={true} assignedKarigarId={order.karigarId} />
                        <div onClick={(e) => e.stopPropagation()}>
                            <DeleteOrderButton orderId={order.id} />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <p className="text-gray-500">Party</p>
                        <p className="font-medium text-gray-900">{order.party.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Karigar</p>
                        <p className="font-medium text-gray-900">{order.karigar.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Delivery</p>
                        <p className="font-medium text-gray-900">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </Link>
        </div>
    )
}
