import Link from "next/link"
import { Plus, Edit, Trash2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import DeletePartyButton from "./components/DeletePartyButton"
export const dynamic = 'force-dynamic'

async function getParties() {
    return await prisma.party.findMany({
        orderBy: { createdAt: "desc" },
    })
}

export default async function PartiesPage() {
    const parties = await getParties()

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Party Management</h1>
                <Link
                    href="/dashboard/parties/new"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>Add Party</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Desktop Table - Hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {parties.map((party) => (
                                <tr key={party.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{party.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{party.phone || "-"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{party.address || "-"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{party.notes || "-"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/dashboard/parties/${party.id}/edit`} className="text-indigo-600 hover:text-indigo-900" title="Edit Party">
                                                <Edit size={18} />
                                            </Link>
                                            <DeletePartyButton partyId={party.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {parties.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No parties found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View - Hidden on desktop */}
                <div className="lg:hidden divide-y divide-gray-200">
                    {parties.map((party) => (
                        <div key={party.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-900">{party.name}</h3>
                                    {party.phone && <p className="text-xs text-gray-600 mt-1">{party.phone}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/dashboard/parties/${party.id}/edit`}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Edit Party"
                                    >
                                        <Edit size={18} />
                                    </Link>
                                    <DeletePartyButton partyId={party.id} />
                                </div>
                            </div>
                            {party.address && (
                                <div className="mb-2">
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="text-xs text-gray-900 mt-0.5">{party.address}</p>
                                </div>
                            )}
                            {party.notes && (
                                <div>
                                    <p className="text-xs text-gray-500">Notes</p>
                                    <p className="text-xs text-gray-900 mt-0.5">{party.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {parties.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No parties found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
