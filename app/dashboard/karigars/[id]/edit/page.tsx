import { prisma } from "@/lib/prisma"
import KarigarForm from "../../components/KarigarForm"
import { notFound } from "next/navigation"

// No local prisma client instantiation
export const dynamic = 'force-dynamic'

export default async function EditKarigarPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const karigar = await prisma.karigar.findUnique({
        where: { id: id }
    })

    if (!karigar) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Karigar</h1>
            <KarigarForm initialData={karigar} isEdit />
        </div>
    )
}
