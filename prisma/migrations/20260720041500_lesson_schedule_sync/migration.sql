-- AlterTable
ALTER TABLE "lessons" ADD COLUMN "schedule_removed_at" TIMESTAMPTZ(6);

-- Ensure FK sets schedule_id to NULL when schedule is deleted
ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "lessons_schedule_id_fkey";
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Remove duplicate lessons (same course + date + time_slot) keeping the oldest
DELETE FROM "lessons" a
USING "lessons" b
WHERE a.time_slot_id IS NOT NULL
  AND a.course_id = b.course_id
  AND a.date = b.date
  AND a.time_slot_id = b.time_slot_id
  AND a.created_at > b.created_at;

-- CreateUniqueIndex
CREATE UNIQUE INDEX "lessons_course_id_date_time_slot_id_key" ON "lessons"("course_id", "date", "time_slot_id");
