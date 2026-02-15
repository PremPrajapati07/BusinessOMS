require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Connecting...')
    await prisma.$connect()
    console.log('Connected!')
    try {
        const count = await prisma.user.count()
        console.log('User count:', count)
    } catch (e) {
        console.error('Count failed:', e)
    }
}

main()
    .catch((e) => {
        console.error('Main failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
