-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeIdNumber" TEXT NOT NULL,
    "nationalIdNumber" TEXT,
    "bpjsNumber" TEXT,
    "taxIdNumber" TEXT,
    "educatorIdNumber" TEXT,
    "fullName" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "placeOfBirth" TEXT,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "maritalStatus" TEXT,
    "employmentStatus" TEXT NOT NULL DEFAULT 'AKTIF',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "secondaryAddress" TEXT,
    "secondaryProvince" TEXT,
    "secondaryPostalCode" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "hobbies" TEXT,
    "height" REAL,
    "weight" REAL,
    "positionUnit" TEXT,
    "positionData" TEXT,
    "functionUnit" TEXT,
    "taskUnit" TEXT,
    "teachingUnit" TEXT,
    "subjectId" TEXT,
    "joinDate" DATETIME,
    "highestEducation" TEXT,
    "major" TEXT,
    "institutionName" TEXT,
    "graduationYear" INTEGER,
    "departmentId" TEXT,
    "positionId" TEXT,
    "employmentStatusId" TEXT,
    "religionId" TEXT,
    "bloodTypeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_employmentStatusId_fkey" FOREIGN KEY ("employmentStatusId") REFERENCES "EmploymentStatusMaster" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_bloodTypeId_fkey" FOREIGN KEY ("bloodTypeId") REFERENCES "BloodType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("address", "bloodTypeId", "bpjsNumber", "createdAt", "dateOfBirth", "departmentId", "educatorIdNumber", "email", "employeeIdNumber", "employmentStatus", "employmentStatusId", "fullName", "functionUnit", "gender", "graduationYear", "height", "highestEducation", "hobbies", "id", "institutionName", "isBlocked", "joinDate", "major", "maritalStatus", "nationalIdNumber", "phoneNumber", "placeOfBirth", "positionData", "positionId", "positionUnit", "postalCode", "profilePhoto", "province", "religionId", "secondaryAddress", "secondaryPostalCode", "secondaryProvince", "taskUnit", "taxIdNumber", "teachingUnit", "updatedAt", "weight") SELECT "address", "bloodTypeId", "bpjsNumber", "createdAt", "dateOfBirth", "departmentId", "educatorIdNumber", "email", "employeeIdNumber", "employmentStatus", "employmentStatusId", "fullName", "functionUnit", "gender", "graduationYear", "height", "highestEducation", "hobbies", "id", "institutionName", "isBlocked", "joinDate", "major", "maritalStatus", "nationalIdNumber", "phoneNumber", "placeOfBirth", "positionData", "positionId", "positionUnit", "postalCode", "profilePhoto", "province", "religionId", "secondaryAddress", "secondaryPostalCode", "secondaryProvince", "taskUnit", "taxIdNumber", "teachingUnit", "updatedAt", "weight" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_employeeIdNumber_key" ON "Employee"("employeeIdNumber");
CREATE UNIQUE INDEX "Employee_nationalIdNumber_key" ON "Employee"("nationalIdNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
