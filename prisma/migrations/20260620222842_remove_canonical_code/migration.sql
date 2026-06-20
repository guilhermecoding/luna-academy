/*
  Warnings:

  - You are about to drop the column `canonical_code` on the `periods` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "periods_canonical_code_key";

-- AlterTable
ALTER TABLE "periods" DROP COLUMN "canonical_code";
