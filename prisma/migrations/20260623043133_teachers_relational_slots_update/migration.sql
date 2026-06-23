/*
  Warnings:

  - You are about to drop the `course_assistants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "course_assistants" DROP CONSTRAINT "course_assistants_assistant_id_fkey";

-- DropForeignKey
ALTER TABLE "course_assistants" DROP CONSTRAINT "course_assistants_course_id_fkey";

-- DropIndex
DROP INDEX "schedules_teacher_id_day_of_week_time_slot_id_key";

-- DropTable
DROP TABLE "course_assistants";

-- CreateTable
CREATE TABLE "schedule_assistants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schedule_id" UUID NOT NULL,
    "assistant_id" TEXT NOT NULL,

    CONSTRAINT "schedule_assistants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_assistants_schedule_id_assistant_id_key" ON "schedule_assistants"("schedule_id", "assistant_id");

-- AddForeignKey
ALTER TABLE "schedule_assistants" ADD CONSTRAINT "schedule_assistants_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "better_auth"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_assistants" ADD CONSTRAINT "schedule_assistants_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
