-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "isCertifiedTeacher" BOOLEAN NOT NULL,
    "certificationBaseSchool" TEXT,
    "educationCertificateNumber" TEXT,
    "certificationYear" INTEGER,
    "inpassingBaseSchool" TEXT,
    "inpassingSkNumber" TEXT,
    "inpassingSkYear" INTEGER,
    "file" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Certification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
