-- Remove duplicate attendances keeping the oldest record per (lesson_id, student_id)
DELETE FROM "public"."attendances" a
USING "public"."attendances" b
WHERE a.id > b.id
  AND a.lesson_id = b.lesson_id
  AND a.student_id = b.student_id;

-- CreateIndex
CREATE UNIQUE INDEX "attendances_lesson_id_student_id_key" ON "public"."attendances"("lesson_id", "student_id");
