import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import OrderActions from "../components/OrderActions"
import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"

// No local prisma client instantiation
export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const order = await prisma.order.findUnique({
        where: { id: Number(id) },
        include: {
            party: true,
            karigar: true,
            images: true,
            diamondEntries: true,
            materialIssued: {
                include: { diamondEntries: true }
            },
            materialUsed: {
                include: { diamondEntries: true }
            }
        }
    })

    if (!order) notFound()

    return (
        <div className="space-y-4 lg:space-y-6 max-w-6xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/orders" className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={18} className="lg:w-5 lg:h-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg lg:text-2xl font-bold text-gray-900">Order OE{String(order.id).padStart(4, '0')}</h1>
                        <p className="text-xs lg:text-sm text-gray-500">Job Work No: {order.id}</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Link
                        href={`/dashboard/orders/${order.id}/edit`}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors text-sm"
                    >
                        <FileText size={18} />
                        <span>Edit Order</span>
                    </Link>
                    <OrderActions order={order} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Left Column: Order Info */}
                <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                    {/* Basic Details */}
                    <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 border-b pb-2">Order Information</h3>
                        <div className="grid grid-cols-2 gap-3 lg:gap-4">
                            <div><p className="text-gray-500 text-xs lg:text-sm">Party</p><p className="font-semibold text-sm lg:text-base">{order.party.name}</p></div>
                            <div><p className="text-gray-500 text-xs lg:text-sm">Karigar</p><p className="font-semibold text-sm lg:text-base">{order.karigar.name}</p></div>
                            <div><p className="text-gray-500 text-xs lg:text-sm">Issue Date</p><p className="font-medium text-sm lg:text-base">{new Date(order.issueDate).toLocaleDateString()}</p></div>
                            <div><p className="text-gray-500 text-xs lg:text-sm">Delivery Date</p><p className="font-medium text-sm lg:text-base">{new Date(order.deliveryDate).toLocaleDateString()}</p></div>
                            <div><p className="text-gray-500 text-xs lg:text-sm">Status</p><p className="font-medium"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">{order.status}</span></p></div>
                            {order.partyOrderNo && <div><p className="text-gray-500 text-xs lg:text-sm">Party Order No</p><p className="font-medium text-sm lg:text-base">{order.partyOrderNo}</p></div>}
                        </div>
                    </div>

                    {/* Item & Gold Details */}
                    <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 border-b pb-2">Item & Gold Details</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                            <div><p className="text-gray-500 text-xs lg:text-sm">Category</p><p className="font-medium text-sm lg:text-base">{order.itemCategory}</p></div>
                            <div><p className="text-gray-500 text-xs lg:text-sm">Purity</p><p className="font-medium text-sm lg:text-base">{order.purity}</p></div>
                            <div><p className="text-gray-500 text-xs lg:text-sm">Gold Color</p><p className="font-medium text-sm lg:text-base">{order.goldColor || "N/A"}</p></div>
                            <div><p className="text-gray-500 text-xs lg:text-sm">Weight</p><p className="font-medium text-sm lg:text-base">{order.weight} g</p></div>
                            <div><p className="text-gray-500 text-xs lg:text-sm">Quantity</p><p className="font-medium text-sm lg:text-base">{order.quantity}</p></div>
                            <div><p className="text-gray-500 text-xs lg:text-sm">Rate Booked</p><p className="font-medium text-sm lg:text-base">{order.isRateBooked ? `₹${order.bookedRate}` : "No"}</p></div>
                            {order.size && <div><p className="text-gray-500 text-xs lg:text-sm">Size</p><p className="font-medium text-sm lg:text-base">{order.size}</p></div>}
                            {order.screwType && <div><p className="text-gray-500 text-xs lg:text-sm">Screw Type</p><p className="font-medium text-sm lg:text-base">{order.screwType}</p></div>}
                            {order.itemCategory === "Pendant" && (
                                <div><p className="text-gray-500 text-xs lg:text-sm">Chain</p><p className="font-medium text-sm lg:text-base">{order.hasChain ? `With Chain (${order.chainLength})` : "Without Chain"}</p></div>
                            )}
                        </div>
                        {order.cadFileUrl && (
                            <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t">
                                <p className="text-gray-500 text-xs lg:text-sm mb-2">CAD File</p>
                                <a href={order.cadFileUrl} target="_blank" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-xs lg:text-sm">
                                    <FileText size={14} className="lg:w-4 lg:h-4" /> View CAD File
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Diamond Details */}
                    {order.diamondEntries && order.diamondEntries.length > 0 && Number(order.diamondEntries[0].pieces) > 0 && (
                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 border-b pb-2">Diamond Details</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs lg:text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-2 text-left font-medium text-gray-600">Shape</th>
                                            <th className="p-2 text-left font-medium text-gray-600">Size (mm)</th>
                                            <th className="p-2 text-left font-medium text-gray-600">Sieve</th>
                                            <th className="p-2 text-left font-medium text-gray-600">Pieces</th>
                                            <th className="p-2 text-left font-medium text-gray-600">Weight</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.diamondEntries.map((entry) => (
                                            <tr key={entry.id} className="border-t">
                                                <td className="p-2">{entry.shape}</td>
                                                <td className="p-2">{entry.sizeMM || "-"}</td>
                                                <td className="p-2">{entry.sieveSize || "-"}</td>
                                                <td className="p-2">{entry.pieces}</td>
                                                <td className="p-2">{entry.weight} ct</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    {order.remarks && (
                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-base lg:text-lg font-bold mb-3 border-b pb-2">Remarks</h3>
                            <p className="text-sm lg:text-base text-gray-800 bg-red-50 p-3 rounded border-l-4 border-red-400">{order.remarks}</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Images */}
                <div className="space-y-4 lg:space-y-6">
                    <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 border-b pb-2">Design Images ({order.images.length})</h3>
                        {order.images.length > 0 ? (
                            <div className="space-y-2 lg:space-y-3">
                                {order.images.map((img, idx) => (
                                    <img
                                        key={img.id}
                                        src={img.imageUrl}
                                        alt={`Design ${idx + 1}`}
                                        className={`w-full rounded border cursor-pointer hover:opacity-90 transition-opacity ${idx === 0 ? 'h-48 lg:h-64' : 'h-24 lg:h-32'} object-cover`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-32 lg:h-40 bg-gray-50 flex items-center justify-center text-gray-400 text-sm rounded">No Images</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
