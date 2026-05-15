-- CreateTable
CREATE TABLE "Kesediaan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "isBersedia" BOOLEAN NOT NULL,
    "alasanKesanggupan" TEXT,
    "kesediaanHariKerja" TEXT,
    "photo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Kesediaan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
