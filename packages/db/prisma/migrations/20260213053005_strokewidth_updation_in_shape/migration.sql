/*
  Warnings:

  - The `strokeWidth` column on the `Shape` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Shape" ALTER COLUMN "strokeColor" SET DEFAULT '#ffffff',
DROP COLUMN "strokeWidth",
ADD COLUMN     "strokeWidth" INTEGER NOT NULL DEFAULT 2;
