import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user) {
                    return null
                }

                let isPasswordValid = false
                if (user.password.startsWith('$2')) {
                    isPasswordValid = await compare(credentials.password, user.password)
                } else {
                    isPasswordValid = credentials.password === user.password
                }

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.role,
                    role: user.role,
                    karigarId: user.karigarId
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
                (session.user as any).role = token.role;
                (session.user as any).karigarId = token.karigarId;
            }
            return session
        },
        async jwt({ token, user }: { token: any, user?: any }) {
            if (user) {
                token.role = user.role;
                token.karigarId = user.karigarId;
            }
            return token
        }
    }
}
