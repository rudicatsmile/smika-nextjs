-- CreateTable
CREATE TABLE "WorkUnit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "worksElsewhere" BOOLEAN NOT NULL,
    "workplaceName" TEXT,
    "status" TEXT,
    "position" TEXT,
    "positionFunction" TEXT,
    "workplaceAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkUnit_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
