/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,documentType]` on the table `ImportantDocument` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ImportantDocument_employeeId_documentType_key" ON "ImportantDocument"("employeeId", "documentType");
