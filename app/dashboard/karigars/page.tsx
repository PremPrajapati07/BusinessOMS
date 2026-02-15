import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Plus, Edit } from "lucide-react"
import DeleteKarigarButton from "./components/DeleteKarigarButton"

// No local prisma client instantiation
export const dynamic = 'force-dynamic'

async function getKarigars() {
    return await prisma.karigar.findMany({
        orderBy: { createdAt: "desc" },
    })
}

export default async function KarigarsPage() {
    const karigars = await getKarigars()

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Karigar Management</h1>
                <Link
                    href="/dashboard/karigars/new"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>Add Karigar</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Desktop Table - Hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone / Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {karigars.map((karigar) => (
                                <tr key={karigar.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <Link href={`/dashboard/karigars/${karigar.id}/ledger`} className="text-indigo-600 hover:text-indigo-900 hover:underline">
                                            {karigar.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {karigar.phone}
                                        {karigar.location && <span className="text-gray-400 mx-2">|</span>}
                                        {karigar.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{karigar.specialization || "-"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{karigar.notes || "-"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/dashboard/karigars/${karigar.id}/edit`} className="text-indigo-600 hover:text-indigo-900" title="Edit Karigar">
                                                <Edit size={18} />
                                            </Link>
                                            <DeleteKarigarButton karigarId={karigar.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {karigars.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No karigars found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View - Hidden on desktop */}
                <div className="lg:hidden divide-y divide-gray-200">
                    {karigars.map((karigar) => (
                        <div key={karigar.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <Link href={`/dashboard/karigars/${karigar.id}/ledger`} className="text-sm font-bold text-gray-900 hover:text-indigo-600 block">
                                        {karigar.name}
                                    </Link>
                                    <p className="text-xs text-gray-600 mt-1">{karigar.phone}</p>
                                    {karigar.location && <p className="text-xs text-gray-500 mt-0.5">{karigar.location}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/dashboard/karigars/${karigar.id}/edit`}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Edit Karigar"
                                    >
                                        <Edit size={18} />
                                    </Link>
                                    <DeleteKarigarButton karigarId={karigar.id} />
                                </div>
                            </div>
                            {karigar.specialization && (
                                <div className="mb-2">
                                    <p className="text-xs text-gray-500">Specialization</p>
                                    <p className="text-xs text-gray-900 mt-0.5">{karigar.specialization}</p>
                                </div>
                            )}
                            {karigar.notes && (
                                <div>
                                    <p className="text-xs text-gray-500">Notes</p>
                                    <p className="text-xs text-gray-900 mt-0.5">{karigar.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {karigars.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No karigars found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
