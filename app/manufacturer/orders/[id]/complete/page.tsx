
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import CompletionForm from "@/app/manufacturer/components/CompletionForm"

export const dynamic = 'force-dynamic'

export default async function OrderCompletionPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "MANUFACTURER" && session.user.role !== "ADMIN")) {
        return redirect("/login")
    }

    // Role-based logic: if Manufacturer, must be their order. If Admin, can be any.
    const isManufacturer = session.user.role === "MANUFACTURER"
    const karigarId = isManufacturer ? session.user.karigarId : null

    const { id } = await params
    const orderId = parseInt(id)

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            party: true,
            materialIssued: {
                include: { diamondEntries: true }
            },
            diamondEntries: true // Required diamonds from order
        }
    })

    if (!order) return notFound()

    if (isManufacturer && order.karigarId !== karigarId) {
        return <div className="p-8 text-center text-red-600">Unauthorized: You cannot complete an order assigned to someone else.</div>
    }

    if (order.status !== "RECEIVED") {
        return (
            <div className="p-8 text-center">
                <h1 className="text-xl font-bold mb-2">Cannot Complete Order</h1>
                <p className="text-gray-600">Order status must be RECEIVED to complete it. Current status: {order.status}</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Complete Order #{order.id}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Reference Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">Order Specifications</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Item:</span> <span className="font-medium">{order.itemCategory}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Party:</span> <span className="font-medium">{order.party.name}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Required Purity:</span> <span className="font-medium">{order.purity}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Required Weight:</span> <span className="font-medium">{order.weight} g</span></div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 border-b border-indigo-200 pb-2 mb-4">Issued Material</h3>
                        {order.materialIssued ? (
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-indigo-700">Issued Purity:</span> <span className="font-bold">{order.materialIssued.purity}</span></div>
                                <div className="flex justify-between"><span className="text-indigo-700">Issued Color:</span> <span className="font-bold">{order.materialIssued.goldColor}</span></div>
                                <div className="flex justify-between"><span className="text-indigo-700">Issued Weight:</span> <span className="font-bold text-lg">{order.materialIssued.weight} g</span></div>
                                <div className="flex justify-between"><span className="text-indigo-700">Melting:</span> <span className="font-bold">{order.materialIssued.melting}%</span></div>

                                {order.materialIssued.diamondEntries.length > 0 && (
                                    <div className="pt-2 border-t border-indigo-200 mt-2">
                                        <span className="text-xs font-bold text-indigo-700 uppercase block mb-1">Issued Diamonds</span>
                                        <ul className="list-disc list-inside text-indigo-800 text-xs">
                                            {order.materialIssued.diamondEntries.map((d, i) => (
                                                <li key={i}>{d.pieces} pcs ({d.weight} ct) - {d.shape} {d.sizeMM || d.sieveSize}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-indigo-600 text-sm">No specific material record linked.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Completion Form */}
                <div>
                    <CompletionForm order={order} />
                </div>
            </div>
        </div>
    )
}
