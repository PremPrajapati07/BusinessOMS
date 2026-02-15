import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { id } = await params
        const body = await request.json()
        const { status } = body

        if (!status) return NextResponse.json({ error: "Status is required" }, { status: 400 })

        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            select: { karigarId: true }
        })

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        // Check if user is Admin or the assigned Karigar
        const isAdmin = session.user.role === "ADMIN"
        const isAssignedKarigar = session.user.role === "MANUFACTURER" && session.user.karigarId === order.karigarId

        if (!isAdmin && !isAssignedKarigar) {
            return NextResponse.json({ error: "Unauthorized: Not assigned to this order" }, { status: 403 })
        }

        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status }
        })

        return NextResponse.json(updatedOrder)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }
}
