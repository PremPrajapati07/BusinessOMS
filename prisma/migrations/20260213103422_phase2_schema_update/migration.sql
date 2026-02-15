-- CreateTable
CREATE TABLE "DiamondEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" INTEGER NOT NULL,
    "shape" TEXT,
    "sizeMM" TEXT,
    "sieveSize" TEXT,
    "pieces" INTEGER NOT NULL DEFAULT 0,
    "weight" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiamondEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "partyId" TEXT NOT NULL,
    "karigarId" TEXT NOT NULL,
    "deliveryDate" DATETIME NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weight" REAL NOT NULL,
    "partyOrderNo" TEXT,
    "itemCategory" TEXT NOT NULL,
    "purity" TEXT NOT NULL,
    "size" TEXT,
    "screwType" TEXT,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "issueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "goldColor" TEXT,
    "isRateBooked" BOOLEAN NOT NULL DEFAULT false,
    "bookedRate" REAL,
    "cadFileUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_karigarId_fkey" FOREIGN KEY ("karigarId") REFERENCES "Karigar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "deliveryDate", "id", "itemCategory", "karigarId", "partyId", "partyOrderNo", "purity", "quantity", "remarks", "screwType", "size", "status", "updatedAt", "weight") SELECT "createdAt", "deliveryDate", "id", "itemCategory", "karigarId", "partyId", "partyOrderNo", "purity", "quantity", "remarks", "screwType", "size", "status", "updatedAt", "weight" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
