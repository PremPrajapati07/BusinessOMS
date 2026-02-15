-- CreateTable
CREATE TABLE "OrderMaterialIssued" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" INTEGER NOT NULL,
    "purity" TEXT NOT NULL,
    "melting" REAL NOT NULL,
    "goldColor" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrderMaterialIssued_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IssuedDiamondEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "materialIssuedId" TEXT NOT NULL,
    "shape" TEXT,
    "sizeMM" TEXT,
    "sieveSize" TEXT,
    "pieces" INTEGER NOT NULL DEFAULT 0,
    "weight" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "IssuedDiamondEntry_materialIssuedId_fkey" FOREIGN KEY ("materialIssuedId") REFERENCES "OrderMaterialIssued" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderMaterialUsed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" INTEGER NOT NULL,
    "usedWeight" REAL NOT NULL,
    "wastage" REAL NOT NULL,
    "finalMelting" REAL NOT NULL,
    "finalColor" TEXT NOT NULL,
    "finalProductWeight" REAL NOT NULL,
    "usageDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrderMaterialUsed_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UsedDiamondEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "materialUsedId" TEXT NOT NULL,
    "shape" TEXT,
    "sizeMM" TEXT,
    "sieveSize" TEXT,
    "usedPieces" INTEGER NOT NULL DEFAULT 0,
    "finalWeight" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "UsedDiamondEntry_materialUsedId_fkey" FOREIGN KEY ("materialUsedId") REFERENCES "OrderMaterialUsed" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KarigarLedger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "karigarId" TEXT NOT NULL,
    "totalGoldIssued" REAL NOT NULL DEFAULT 0,
    "totalGoldUsed" REAL NOT NULL DEFAULT 0,
    "totalWastage" REAL NOT NULL DEFAULT 0,
    "totalDiamondPcsIssued" INTEGER NOT NULL DEFAULT 0,
    "totalDiamondWtIssued" REAL NOT NULL DEFAULT 0,
    "totalDiamondPcsUsed" INTEGER NOT NULL DEFAULT 0,
    "totalDiamondWtUsed" REAL NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KarigarLedger_karigarId_fkey" FOREIGN KEY ("karigarId") REFERENCES "Karigar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "karigarId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_karigarId_fkey" FOREIGN KEY ("karigarId") REFERENCES "Karigar" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "OrderMaterialIssued_orderId_key" ON "OrderMaterialIssued"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderMaterialUsed_orderId_key" ON "OrderMaterialUsed"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "KarigarLedger_karigarId_key" ON "KarigarLedger"("karigarId");
