import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
export const dynamic = 'force-dynamic'

// Helper to fix the route params type
// According to Next.js docs, params is a Promise in recent versions or just an object.
// But mostly { params: { id: string } } works.
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { id } = await params
        const party = await prisma.party.findUnique({
            where: { id }
        })
        if (!party) return NextResponse.json({ error: "Party not found" }, { status: 404 })
        return NextResponse.json(party)
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { id } = await params
        const body = await request.json()
        const { name, phone, address, gst, notes } = body

        const party = await prisma.party.update({
            where: { id },
            data: { name, phone, address, gst, notes }
        })
        return NextResponse.json(party)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 })
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
        await prisma.party.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete Party Error:", error)
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}
