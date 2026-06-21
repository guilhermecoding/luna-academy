-- AlterTable
ALTER TABLE "students" RENAME COLUMN "school" TO "origin_school";

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "origin_school" DROP NOT NULL;
