"use server";

import { updateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireAdminWrite } from "@/lib/auth-guards";
import {
    requireCourseMutationAccess,
    requireLessonAttendanceMutationAccess,
    requireTeacherScheduleMutationAccess,
} from "@/lib/teacher-period-guards";
import {
    createLesson,
    deleteLesson,
    updateLesson,
    bulkUpdateAttendance,
} from "@/services/lessons/lessons.service";
import { syncCourseLessons } from "@/services/courses/courses.service";
import {
    createLessonSchema,
    updateLessonSchema,
    bulkUpdateAttendanceSchema,
    type CreateLessonInput,
    type UpdateLessonInput,
    type BulkUpdateAttendanceInput,
} from "./schema";
import { ZodError } from "zod";

function mapLessonUniqueError(error: unknown): string | null {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return "Já existe uma aula nesta data e horário.";
    }
    return null;
}

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

        const adminResult = await requireAdminWrite();
        if (!adminResult.ok) {
            const scheduleAccess = await requireTeacherScheduleMutationAccess(
                course.id,
                validated.scheduleId || null,
                authResult.session.user.id,
            );
            if (!scheduleAccess.ok) {
                return { success: false, error: scheduleAccess.error };
            }
        }

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
        const uniqueMsg = mapLessonUniqueError(error);
        if (uniqueMsg) return { success: false, error: uniqueMsg };
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

        const existingLesson = await prisma.lesson.findFirst({
            where: { id: validated.lessonId, courseId: course.id },
            select: { scheduleId: true },
        });
        if (!existingLesson) {
            return { success: false, error: "Aula não encontrada." };
        }

        const adminResult = await requireAdminWrite();
        if (!adminResult.ok) {
            const targetScheduleId = validated.scheduleId || existingLesson.scheduleId;
            const scheduleAccess = await requireTeacherScheduleMutationAccess(
                course.id,
                targetScheduleId,
                authResult.session.user.id,
            );
            if (!scheduleAccess.ok) {
                return { success: false, error: scheduleAccess.error };
            }
        }

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
            scheduleRemovedAt: validated.scheduleId ? null : undefined,
        });

        updateTag(`course:${course.id}:lessons`);

        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        const uniqueMsg = mapLessonUniqueError(error);
        if (uniqueMsg) return { success: false, error: uniqueMsg };
        console.error("Erro ao atualizar aula:", error);
        return { success: false, error: "Erro ao atualizar aula." };
    }
}

export async function syncCourseLessonsAction(
    programSlug: string,
    periodSlug: string,
    classGroupSlug: string,
    courseCode: string,
) {
    const authResult = await requireCourseMutationAccess(
        programSlug,
        periodSlug,
        classGroupSlug,
        courseCode,
    );
    if (!authResult.ok) return { success: false, error: authResult.error };

    const adminResult = await requireAdminWrite();
    if (!adminResult.ok) return { success: false, error: adminResult.error };

    try {
        const { course } = authResult.resolved;
        const result = await syncCourseLessons(course.id);

        updateTag(`course:${course.id}:lessons`);
        updateTag(`course:${course.id}:lessons-count`);

        return {
            success: true,
            created: result.created,
            relinked: result.relinked,
            message:
                result.created > 0 || result.relinked > 0
                    ? `${result.created} aula(s) criada(s), ${result.relinked} religada(s).`
                    : "Nenhuma aula nova para sincronizar.",
        };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao sincronizar aulas da grade." };
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

        const existingLesson = await prisma.lesson.findFirst({
            where: { id: lessonId, courseId: course.id },
            select: { scheduleId: true },
        });
        if (!existingLesson) {
            return { success: false, error: "Aula não encontrada." };
        }

        const adminResult = await requireAdminWrite();
        if (!adminResult.ok) {
            const scheduleAccess = await requireTeacherScheduleMutationAccess(
                course.id,
                existingLesson.scheduleId,
                authResult.session.user.id,
            );
            if (!scheduleAccess.ok) {
                return { success: false, error: scheduleAccess.error };
            }
        }

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

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { periodId: true },
        });

        updateTag(`lesson:${lessonId}:attendances`);
        updateTag(`course:${courseId}:lessons`);
        if (course) {
            updateTag(`period:${course.periodId}:indicators`);
        }

        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        console.error("Erro ao salvar presenças:", error);
        return { success: false, error: "Erro ao salvar presenças." };
    }
}
