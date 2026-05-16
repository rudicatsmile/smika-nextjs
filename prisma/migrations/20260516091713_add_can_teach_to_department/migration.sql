-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "departmentType" TEXT NOT NULL DEFAULT 'SEKOLAH',
    "canTeach" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Department" ("code", "createdAt", "departmentType", "description", "id", "isActive", "name", "updatedAt") SELECT "code", "createdAt", "departmentType", "description", "id", "isActive", "name", "updatedAt" FROM "Department";
DROP TABLE "Department";
ALTER TABLE "new_Department" RENAME TO "Department";
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
