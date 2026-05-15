-- CreateTable
CREATE TABLE "EducationHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "educationId" TEXT NOT NULL,
    "institutionName" TEXT,
    "major" TEXT,
    "graduationYear" INTEGER,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "gpa" REAL,
    "isGraduated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EducationHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EducationHistory_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "Education" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
