"use server";

import { updateTag } from "next/cache";
import prisma from "@/lib/prisma";
import {
    requireCourseMutationAccess,
    requireLessonAttendanceMutationAccess,
} from "@/lib/teacher-period-guards";
import {
    createLesson,
    deleteLesson,
    updateLesson,
    bulkUpdateAttendance,
} from "@/services/lessons/lessons.service";
import {
    createLessonSchema,
    updateLessonSchema,
    bulkUpdateAttendanceSchema,
    type CreateLessonInput,
    type UpdateLessonInput,
    type BulkUpdateAttendanceInput,
} from "./schema";
import { ZodError } from "zod";

export async function createLessonAction(
    programSlug: string,
    periodSlug: string,
    classGroupSlug: string,
    courseCode: string,
    data: CreateLessonInput,
) {
    const authResult = await requireCourseMutationAccess(
        programSlug,
        periodSlug,
        classGroupSlug,
        courseCode,
    );
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const validated = createLessonSchema.parse(data);

        const { course } = authResult.resolved;
        const lessonDate = new Date(validated.date + "T00:00:00");

        // Validar colisão: mesma disciplina + mesma data + mesmo timeSlot
        if (validated.timeSlotId) {
            const existing = await prisma.lesson.findFirst({
                where: {
                    courseId: course.id,
                    date: lessonDate,
                    timeSlotId: validated.timeSlotId,
                },
            });
            if (existing) {
                return { success: false, error: "Já existe uma aula nesta data e horário." };
            }
        }

        const lesson = await createLesson({
            courseId: course.id,
            date: lessonDate,
            topic: validated.topic,
            teacherId: validated.teacherId || null,
            timeSlotId: validated.timeSlotId || null,
            scheduleId: validated.scheduleId || null,
        });

        updateTag(`course:${course.id}:lessons`);
        updateTag(`course:${course.id}:lessons-count`);

        return { success: true, lessonId: lesson.id };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        console.error("Erro ao criar aula:", error);
        return { success: false, error: "Erro ao criar aula." };
    }
}

export async function updateLessonAction(
    programSlug: string,
    periodSlug: string,
    classGroupSlug: string,
    courseCode: string,
    data: UpdateLessonInput,
) {
    const authResult = await requireCourseMutationAccess(
        programSlug,
        periodSlug,
        classGroupSlug,
        courseCode,
    );
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const validated = updateLessonSchema.parse(data);

        const { course } = authResult.resolved;
        const lessonDate = new Date(validated.date + "T00:00:00");

        // Validar colisão: mesma disciplina + mesma data + mesmo timeSlot, mas ignorando a própria aula
        if (validated.timeSlotId) {
            const existing = await prisma.lesson.findFirst({
                where: {
                    courseId: course.id,
                    date: lessonDate,
                    timeSlotId: validated.timeSlotId,
                    id: { not: validated.lessonId },
                },
            });
            if (existing) {
                return { success: false, error: "Já existe outra aula nesta data e horário." };
            }
        }

        await updateLesson(validated.lessonId, {
            date: lessonDate,
            topic: validated.topic,
            teacherId: validated.teacherId || null,
            timeSlotId: validated.timeSlotId || null,
            scheduleId: validated.scheduleId || null,
        });

        updateTag(`course:${course.id}:lessons`);
        
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        console.error("Erro ao atualizar aula:", error);
        return { success: false, error: "Erro ao atualizar aula." };
    }
}

export async function deleteLessonAction(
    programSlug: string,
    periodSlug: string,
    classGroupSlug: string,
    courseCode: string,
    lessonId: string,
) {
    const authResult = await requireCourseMutationAccess(
        programSlug,
        periodSlug,
        classGroupSlug,
        courseCode,
    );
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const { course } = authResult.resolved;

        await deleteLesson(lessonId);

        updateTag(`course:${course.id}:lessons`);
        updateTag(`course:${course.id}:lessons-count`);
        updateTag(`lesson:${lessonId}:attendances`);

        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar aula:", error);
        return { success: false, error: "Erro ao deletar aula." };
    }
}

export async function bulkUpdateAttendanceAction(
    courseId: string,
    lessonId: string,
    data: BulkUpdateAttendanceInput,
) {
    const authResult = await requireLessonAttendanceMutationAccess(courseId, lessonId);
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const validated = bulkUpdateAttendanceSchema.parse(data);

        await bulkUpdateAttendance(
            lessonId,
            validated.updates.map((u) => ({
                id: u.id,
                isPresent: u.isPresent,
                observation: u.observation || null,
            })),
        );

        updateTag(`lesson:${lessonId}:attendances`);
        updateTag(`course:${courseId}:lessons`);

        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        console.error("Erro ao salvar presenças:", error);
        return { success: false, error: "Erro ao salvar presenças." };
    }
}
