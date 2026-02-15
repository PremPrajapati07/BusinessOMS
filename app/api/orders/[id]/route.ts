import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { resyncKarigarLedger } from "@/lib/ledger"

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const order = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: {
                party: true,
                karigar: true,
                images: true,
                diamondEntries: true
            }
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        return NextResponse.json(order)
    } catch (error) {
        console.error("Get Order Error:", error)
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    try {
        const { id } = await params
        const orderId = Number(id)

        // 1. Get karigarId before deleting
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { karigarId: true }
        })

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        // 2. Delete the order
        await prisma.order.delete({
            where: { id: orderId }
        })

        // 3. Resync the Ledger (Self-heal)
        await resyncKarigarLedger(order.karigarId)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete Order Error:", error)
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
    }
}
