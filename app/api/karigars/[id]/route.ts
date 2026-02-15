import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { id } = await params
        const karigar = await prisma.karigar.findUnique({
            where: { id }
        })
        if (!karigar) return NextResponse.json({ error: "Karigar not found" }, { status: 404 })
        return NextResponse.json(karigar)
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
        const { name, phone, location, specialization, notes } = body

        const karigar = await prisma.karigar.update({
            where: { id },
            data: { name, phone, location, specialization, notes }
        })
        return NextResponse.json(karigar)
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
        await prisma.karigar.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete Karigar Error:", error)
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}
