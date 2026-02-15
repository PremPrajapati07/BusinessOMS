import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Plus, Eye } from "lucide-react"
import StatusDropdown from "./components/StatusDropdown"
import MobileOrderCard from "./components/MobileOrderCard"
import DeleteOrderButton from "./components/DeleteOrderButton"
export const dynamic = 'force-dynamic'

async function getOrders() {
    return await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { party: true, karigar: true }
    })
}

export default async function OrdersPage() {
    const orders = await getOrders()

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Orders</h1>
                <Link
                    href="/dashboard/orders/new"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>Create Order</span>
                </Link>
            </div>

            {/* Mobile: Card View, Desktop: Table View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Desktop Table - Hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karigar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">OE{String(order.id).padStart(4, '0')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.party.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.karigar.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.itemCategory}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.deliveryDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusDropdown orderId={order.id} currentStatus={order.status} isAdmin={true} assignedKarigarId={order.karigarId} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-3">
                                            <Link href={`/dashboard/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900 flex gap-1 items-center">
                                                <Eye size={16} /> View
                                            </Link>
                                            <DeleteOrderButton orderId={order.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View - Hidden on desktop */}
                <div className="lg:hidden divide-y divide-gray-200">
                    {orders.map((order) => (
                        <MobileOrderCard key={order.id} order={order} />
                    ))}
                    {orders.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No orders found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
