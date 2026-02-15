'use server'


import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function updateOrderStatus(orderId: number, newStatus: string) {
    const session = await getServerSession(authOptions)
    if (!session) {
        throw new Error("Unauthorized")
    }

    // Optional: Check if user is authorized to update this order
    // (e.g. is the assigned karigar or admin)
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { karigarId: true }
    })

    if (!order) {
        throw new Error("Order not found")
    }

    // Admin can always update
    // Manufacturer can only update if assigned
    if (session.user.role === "MANUFACTURER") {
        if (order.karigarId !== session.user.karigarId) {
            throw new Error("Unauthorized: Not assigned to this order")
        }
    }

    await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus }
    })

    revalidatePath("/manufacturer/dashboard")
    revalidatePath("/dashboard/orders")
    return { success: true }
}
