require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

// Try to connect to port 5432 (Session Pooler) on the same host
const url = process.env.DATABASE_URL.replace(':6543', ':5432')

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: url
        }
    }
})

async function main() {
    console.log('Testing connection to SESSION POOLER:', url.replace(/:[^:]*@/, ':****@'))
    try {
        await prisma.$connect()
        console.log('Successfully connected to SESSION POOLER!')
        const result = await prisma.$queryRaw`SELECT 1+1 as result`
        console.log('Query result:', result)
    } catch (e) {
        console.error('Connection failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
