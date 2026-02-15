
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, User, Package, Scale, Scissors, Gem } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ManufacturerOrderDetail({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "MANUFACTURER" || !session.user.karigarId) {
        return redirect("/login")
    }

    const { id } = await params
    const orderId = parseInt(id)

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            party: true,
            images: true,
            diamondEntries: true,
            materialIssued: {
                include: { diamondEntries: true } // Phase 10: Show issued materials
            }
        }
    })

    if (!order) return notFound()

    // Authorization Check
    if (order.karigarId !== session.user.karigarId) {
        return <div className="p-8 text-center text-red-600">Unauthorized: You cannot view this order.</div>
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden pb-20">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <Link href="/manufacturer/dashboard" className="text-gray-600 hover:text-gray-900">
                    <ArrowLeft size={20} />
                </Link>
                <div className="text-center">
                    <h1 className="text-lg font-bold text-gray-900">Order #{order.id.toString().padStart(4, '0')}</h1>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.status === "ISSUED" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "RECEIVED" ? "bg-blue-100 text-blue-800" :
                            "bg-green-100 text-green-800"
                        }`}>
                        {order.status}
                    </span>
                </div>
                <div className="w-5"></div> {/* Spacer */}
            </div>

            <div className="p-5 space-y-6">
                {/* Images */}
                {order.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {order.images.map((img, i) => (
                            <img key={i} src={img.imageUrl} alt="Design" className="h-32 w-auto rounded-lg border object-cover" />
                        ))}
                    </div>
                )}

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1"><Package size={12} /> Item</label>
                        <p className="font-medium text-gray-900">{order.itemCategory}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1"><User size={12} /> Party</label>
                        <p className="font-medium text-gray-900">{order.party.name}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1"><Calendar size={12} /> Delivery</label>
                        <p className="font-medium text-gray-900">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1"><Scale size={12} /> Weight</label>
                        <p className="font-medium text-gray-900">{order.weight} g</p>
                    </div>
                </div>

                {/* Specifications */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Purity</span>
                        <span className="font-medium">{order.purity}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Gold Color</span>
                        <span className="font-medium">{order.goldColor || "-"}</span>
                    </div>
                    {order.size && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Size</span>
                            <span className="font-medium">{order.size}</span>
                        </div>
                    )}
                    {order.itemCategory === "Pendant" && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Chain</span>
                            <span className="font-medium">{order.hasChain ? `Yes (${order.chainLength})` : "No"}</span>
                        </div>
                    )}
                </div>

                {/* Diamond Details */}
                {order.diamondEntries.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1"><Gem size={14} /> Diamonds Required</h3>
                        <div className="border rounded-lg overflow-hidden text-xs">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2">Shape</th>
                                        <th className="p-2">Size</th>
                                        <th className="p-2">Pcs</th>
                                        <th className="p-2">Wt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.diamondEntries.map((d, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="p-2">{d.shape}</td>
                                            <td className="p-2">{d.sizeMM || d.sieveSize}</td>
                                            <td className="p-2">{d.pieces}</td>
                                            <td className="p-2">{d.weight}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Remarks */}
                {order.remarks && (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                        <span className="font-bold block text-xs uppercase mb-1">Remarks</span>
                        {order.remarks}
                    </div>
                )}
            </div>

            {/* Actions Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg max-w-7xl mx-auto z-20">
                {/* Render Button Component (Client Side) based on status */}
                {/* Since we can't embed client components easily inline without separate file, 
                    we can create a separate file or just omit for now and rely on list view for actions.
                    But for better UX, let's include link/button here. */}

                {order.status === "ISSUED" && (
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-2">Accept this order to start work.</p>
                        <form action={async () => {
                            "use server"
                            // We need to import the server action but we can't import server action in server component easily for form action directly? 
                            // Wait, yes we can pass server action to form action prop in Next.js 14.
                            // But checking user confirmation is client side.
                            // So best to use a Client Component wrapper for the button.
                        }}>
                            <Link href="/manufacturer/dashboard" className="w-full block bg-indigo-600 text-white py-3 rounded-xl font-bold text-center">
                                Go to Dashboard to Accept
                            </Link>
                        </form>
                    </div>
                )}

                {order.status === "RECEIVED" && (
                    <Link href={`/manufacturer/orders/${order.id}/complete`} className="w-full block bg-green-600 text-white py-3 rounded-xl font-bold text-center shadow-md hover:bg-green-700 transition-colors">
                        Complete Order & Submit Material
                    </Link>
                )}

                {order.status === "COMPLETED" && (
                    <div className="text-center text-green-600 font-bold flex items-center justify-center gap-2">
                        <CheckCircle size={20} /> Order Completed
                    </div>
                )}
            </div>
        </div>
    )
}

function CheckCircle({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    )
}
