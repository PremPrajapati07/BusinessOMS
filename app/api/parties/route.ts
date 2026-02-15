import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
export const dynamic = 'force-dynamic'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const parties = await prisma.party.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(parties)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch parties" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, phone, address, gst, notes } = body

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        const party = await prisma.party.create({
            data: {
                name,
                phone,
                address,
                gst,
                notes
            }
        })

        return NextResponse.json(party, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Failed to create party" }, { status: 500 })
    }
}
