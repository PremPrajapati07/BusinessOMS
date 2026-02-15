require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@example.com'
    const adminPassword = 'admin' // Storing plain text for MVP simplicity due to env issues

    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: adminPassword,
            role: 'ADMIN'
        },
    })

    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('Error during seeding:', e)
        console.error('Full Error Object:', JSON.stringify(e, null, 2))
        await prisma.$disconnect()
        process.exit(1)
    })
