import { prisma } from "./prisma";

/**
 * Recalculates and updates the KarigarLedger cache for a specific karigar
 * based on the actual Order and Material records in the database.
 */
export async function resyncKarigarLedger(karigarId: string) {
    return await prisma.$transaction(async (tx) => {
        // 1. Get all orders for this karigar
        const orders = await tx.order.findMany({
            where: { karigarId },
            include: {
                diamondEntries: true,
                materialUsed: {
                    include: { diamondEntries: true }
                }
            }
        });

        // 2. Initialize totals
        let totalGoldIssued = 0;
        let totalDiamondPcsIssued = 0;
        let totalDiamondWtIssued = 0;

        let totalGoldUsed = 0;
        let totalWastage = 0;
        let totalDiamondPcsUsed = 0;
        let totalDiamondWtUsed = 0;

        // 3. Accumulate stats
        for (const order of orders) {
            // Issued totals (always exist for an order)
            totalGoldIssued += order.weight || 0;
            totalDiamondPcsIssued += order.diamondEntries.reduce((sum, d) => sum + (d.pieces || 0), 0);
            totalDiamondWtIssued += order.diamondEntries.reduce((sum, d) => sum + (d.weight || 0), 0);

            // Used totals (only if completed)
            if (order.materialUsed) {
                totalGoldUsed += order.materialUsed.usedWeight || 0;
                totalWastage += order.materialUsed.wastage || 0;
                totalDiamondPcsUsed += order.materialUsed.diamondEntries.reduce((sum, d) => sum + (d.usedPieces || 0), 0);
                totalDiamondWtUsed += order.materialUsed.diamondEntries.reduce((sum, d) => sum + (d.finalWeight || 0), 0);
            }
        }

        // 4. Update the Ledger record
        const ledger = await tx.karigarLedger.upsert({
            where: { karigarId },
            create: {
                karigarId,
                totalGoldIssued,
                totalGoldUsed,
                totalWastage,
                totalDiamondPcsIssued,
                totalDiamondWtIssued,
                totalDiamondPcsUsed,
                totalDiamondWtUsed,
                lastUpdated: new Date()
            },
            update: {
                totalGoldIssued,
                totalGoldUsed,
                totalWastage,
                totalDiamondPcsIssued,
                totalDiamondWtIssued,
                totalDiamondPcsUsed,
                totalDiamondWtUsed,
                lastUpdated: new Date()
            }
        });

        return ledger;
    });
}
