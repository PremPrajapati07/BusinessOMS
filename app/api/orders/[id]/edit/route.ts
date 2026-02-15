import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
export const dynamic = 'force-dynamic'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { id } = await params
        const orderId = parseInt(id)
        const body = await request.json()
        const {
            partyId,
            karigarId,
            deliveryDate,
            quantity,
            weight,
            partyOrderNo,
            itemCategory,
            purity,
            size,
            screwType,
            remarks,
            imageUrls, // Array of strings (existing + new)
            issueDate,
            goldColor,
            isRateBooked,
            bookedRate,
            cadFileUrl,
            diamondEntries, // Array of objects
            hasChain,
            chainLength
        } = body

        // Validation
        if (!partyId || !karigarId || !deliveryDate || !itemCategory || !purity) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Wrap in transaction to ensure atomicity
        const order = await prisma.$transaction(async (tx) => {
            // Delete existing images and diamond entries, then recreate
            await tx.orderImage.deleteMany({ where: { orderId } })
            await tx.diamondEntry.deleteMany({ where: { orderId } })

            return await tx.order.update({
                where: { id: orderId },
                data: {
                    partyId,
                    karigarId,
                    deliveryDate: new Date(deliveryDate),
                    issueDate: issueDate ? new Date(issueDate) : new Date(),
                    quantity: Number(quantity),
                    weight: Number(weight),
                    partyOrderNo,
                    itemCategory,
                    purity,
                    size,
                    screwType,
                    remarks,
                    goldColor,
                    isRateBooked: Boolean(isRateBooked),
                    bookedRate: bookedRate ? Number(bookedRate) : null,
                    cadFileUrl,
                    hasChain: Boolean(hasChain),
                    chainLength: chainLength || null,
                    images: {
                        create: (imageUrls || []).map((url: string) => ({ imageUrl: url }))
                    },
                    diamondEntries: {
                        create: (diamondEntries || []).map((entry: any) => ({
                            shape: entry.shape,
                            sizeMM: entry.sizeMM,
                            sieveSize: entry.sieveSize,
                            pieces: Number(entry.pieces || 0),
                            weight: Number(entry.weight || 0.0),
                        }))
                    }
                },
                include: {
                    images: true,
                    diamondEntries: true,
                    party: true,
                    karigar: true
                }
            })
        })

        return NextResponse.json(order, { status: 200 })
    } catch (error) {
        console.error("Update Order Error:", error)
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }
}
