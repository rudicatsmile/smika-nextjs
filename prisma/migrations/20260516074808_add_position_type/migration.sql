-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Position" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "positionType" TEXT NOT NULL DEFAULT 'SEKOLAH',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Position" ("createdAt", "description", "id", "isActive", "name", "updatedAt") SELECT "createdAt", "description", "id", "isActive", "name", "updatedAt" FROM "Position";
DROP TABLE "Position";
ALTER TABLE "new_Position" RENAME TO "Position";
CREATE UNIQUE INDEX "Position_name_key" ON "Position"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
