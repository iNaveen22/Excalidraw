/*
  Warnings:

  - Added the required column `strokeColor` to the `Shape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strokeWidth` to the `Shape` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shape" ADD COLUMN     "strokeColor" TEXT NOT NULL,
ADD COLUMN     "strokeWidth" TEXT NOT NULL;
