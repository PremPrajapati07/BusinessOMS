import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('Clearing database...')

    // Order of deletion matters due to foreign keys
    await prisma.orderMaterialUsed.deleteMany()
    await prisma.issuedDiamondEntry.deleteMany()
    await prisma.usedDiamondEntry.deleteMany()
    await prisma.orderMaterialIssued.deleteMany()
    await prisma.diamondEntry.deleteMany()
    await prisma.orderImage.deleteMany()
    await prisma.order.deleteMany()
    await prisma.karigarLedger.deleteMany()
    await prisma.user.deleteMany()
    await prisma.karigar.deleteMany()
    await prisma.party.deleteMany()

    console.log('Database cleared successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
