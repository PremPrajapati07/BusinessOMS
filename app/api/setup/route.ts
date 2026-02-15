import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(request: Request) {
    try {
        const count = await prisma.user.count()
        if (count > 0) {
            return NextResponse.json({ error: "Admin already exists" }, { status: 403 })
        }

        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 })
        }

        const hashedPassword = await hash(password, 12)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "ADMIN"
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("Setup Check/Create Error:", error)
        return NextResponse.json({ error: "Setup failed: " + (error as Error).message }, { status: 500 })
    }
}
