-- CreateTable
CREATE TABLE "Spouse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "placeOfBirth" TEXT,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "relationship" TEXT,
    "educationId" TEXT,
    "occupationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Spouse_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Spouse_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "Education" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Spouse_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
