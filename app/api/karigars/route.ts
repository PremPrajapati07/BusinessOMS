import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
export const dynamic = 'force-dynamic'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const karigars = await prisma.karigar.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(karigars)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch karigars" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await request.json()
        const { name, phone, location, specialization, notes, email, password } = body

        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })

        // 1. Check if email already exists if provided
        if (email) {
            const existing = await prisma.user.findUnique({ where: { email } })
            if (existing) return NextResponse.json({ error: "Email already taken" }, { status: 400 })
        }

        // 2. Hash password if provided
        let hashedPassword = null
        if (password) {
            const salt = await bcrypt.genSalt(10)
            hashedPassword = await bcrypt.hash(password, salt)
        }

        // 3. Create Karigar and User in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const karigar = await tx.karigar.create({
                data: { name, phone, location, specialization, notes }
            })

            if (email && hashedPassword) {
                await tx.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        role: "MANUFACTURER",
                        karigarId: karigar.id
                    }
                })
            }

            return karigar
        })

        return NextResponse.json(result, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to create karigar" }, { status: 500 })
    }
}
