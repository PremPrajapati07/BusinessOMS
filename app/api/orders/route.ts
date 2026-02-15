import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
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
            imageUrls, // Array of strings
            // Phase 2 Fields
            issueDate,
            goldColor,
            isRateBooked,
            bookedRate,
            cadFileUrl,
            cadFileContent, // Phase 2: Base64 content
            diamondEntries, // Array of objects
            // Pendant Chain Options
            hasChain,
            chainLength,
            materialIssued // Phase 10
        } = body

        // Validation
        if (!partyId || !karigarId || !deliveryDate || !itemCategory || !purity) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
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
                    status: "ISSUED",
                    goldColor,
                    isRateBooked: Boolean(isRateBooked),
                    bookedRate: bookedRate ? Number(bookedRate) : null,
                    cadFileUrl,
                    cadFileContent,
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
                    },
                    materialIssued: {
                        create: {
                            purity: purity,
                            melting: 0,
                            goldColor: goldColor,
                            weight: Number(weight || 0),
                            diamondEntries: {
                                create: (diamondEntries || []).map((entry: any) => ({
                                    shape: entry.shape,
                                    sizeMM: entry.sizeMM,
                                    sieveSize: entry.sieveSize,
                                    pieces: Number(entry.pieces || 0),
                                    weight: Number(entry.weight || 0.0),
                                }))
                            }
                        }
                    }
                },
                include: {
                    images: true,
                    diamondEntries: true,
                    materialIssued: {
                        include: { diamondEntries: true }
                    }
                }
            })

            // Update Karigar Ledger with Issued stats immediately
            const totalDiaPcs = (diamondEntries || []).reduce((sum: number, entry: any) => sum + Number(entry.pieces || 0), 0)
            const totalDiaWt = (diamondEntries || []).reduce((sum: number, entry: any) => sum + Number(entry.weight || 0.0), 0)

            await tx.karigarLedger.upsert({
                where: { karigarId: karigarId },
                create: {
                    karigarId: karigarId,
                    totalGoldIssued: Number(weight || 0),
                    totalDiamondPcsIssued: totalDiaPcs,
                    totalDiamondWtIssued: totalDiaWt,
                    totalGoldUsed: 0,
                    totalWastage: 0,
                    totalDiamondPcsUsed: 0,
                    totalDiamondWtUsed: 0
                },
                update: {
                    totalGoldIssued: { increment: Number(weight || 0) },
                    totalDiamondPcsIssued: { increment: totalDiaPcs },
                    totalDiamondWtIssued: { increment: totalDiaWt },
                    lastUpdated: new Date()
                }
            })

            return newOrder
        })

        return NextResponse.json(order, { status: 201 })
    } catch (error) {
        console.error("Create Order Error:", error)
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }
}
