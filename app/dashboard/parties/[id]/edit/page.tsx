import { prisma } from "@/lib/prisma"
import PartyForm from "../../components/PartyForm"
import { notFound } from "next/navigation"

// No local prisma client instantiation
export const dynamic = 'force-dynamic'

export default async function EditPartyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const party = await prisma.party.findUnique({
        where: { id: id }
    })

    if (!party) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Party</h1>
            <PartyForm initialData={party} isEdit />
        </div>
    )
}
