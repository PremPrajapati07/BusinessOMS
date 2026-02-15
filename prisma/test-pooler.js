require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
})

async function main() {
    console.log('Testing connection to:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')) // Log URL without password
    try {
        await prisma.$connect()
        console.log('Successfully connected to database!')

        // Try a simple query
        const result = await prisma.$queryRaw`SELECT 1+1 as result`
        console.log('Query result:', result)

    } catch (e) {
        console.error('Connection failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
