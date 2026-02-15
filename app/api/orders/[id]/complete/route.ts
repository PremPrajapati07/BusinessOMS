import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { id } = await params
        const orderId = parseInt(id)
        const body = await request.json()

        const {
            usedWeight,
            wastage,
            finalMelting,
            finalColor,
            finalProductWeight,
            remarks,
            diamondEntries // array of { shape, sizeMM, usedPieces, finalWeight }
        } = body

        // Validate only core fields
        if (!usedWeight || !wastage || !finalColor) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Get Order and Issued Details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { materialIssued: true }
        })

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        if (session.user.role === "MANUFACTURER" && order.karigarId !== session.user.karigarId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Material Used Record
            const materialUsed = await tx.orderMaterialUsed.create({
                data: {
                    orderId,
                    usedWeight: Number(usedWeight),
                    wastage: Number(wastage),
                    finalMelting: Number(finalMelting || 0),
                    finalColor,
                    finalProductWeight: Number(finalProductWeight || 0),
                    remarks,
                    diamondEntries: {
                        create: (diamondEntries || []).map((d: any) => ({
                            shape: d.shape,
                            sizeMM: d.sizeMM,
                            usedPieces: Number(d.usedPieces || 0),
                            finalWeight: Number(d.finalWeight || 0)
                        }))
                    }
                }
            })

            // 2. Update Order Status and Actual Delivery Date
            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: "COMPLETED",
                    actualDeliveryDate: new Date()
                }
            })

            const totalDiamondPcsUsed = (diamondEntries || []).reduce((acc: number, d: any) => acc + Number(d.usedPieces || 0), 0)
            const totalDiamondWtUsed = (diamondEntries || []).reduce((acc: number, d: any) => acc + Number(d.finalWeight || 0), 0)

            await tx.karigarLedger.upsert({
                where: { karigarId: order.karigarId },
                create: {
                    karigarId: order.karigarId,
                    totalGoldIssued: 0, // Should have been created at issuance
                    totalGoldUsed: Number(usedWeight),
                    totalWastage: Number(wastage),
                    totalDiamondPcsIssued: 0,
                    totalDiamondWtIssued: 0,
                    totalDiamondPcsUsed,
                    totalDiamondWtUsed
                },
                update: {
                    totalGoldUsed: { increment: Number(usedWeight) },
                    totalWastage: { increment: Number(wastage) },
                    totalDiamondPcsUsed: { increment: totalDiamondPcsUsed },
                    totalDiamondWtUsed: { increment: totalDiamondWtUsed },
                    lastUpdated: new Date()
                }
            })

            return materialUsed
        })

        return NextResponse.json({ success: true, result })

    } catch (error) {
        console.error("Completion Error:", error)
        return NextResponse.json({ error: "Failed to complete order" }, { status: 500 })
    }
}
