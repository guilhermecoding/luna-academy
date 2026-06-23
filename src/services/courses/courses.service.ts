import { Course, DayOfWeek, Prisma, Shift } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import {
    findScheduleConflictInList,
    resolveScheduleRoomId,
    type ScheduleSlot,
} from "@/lib/schedule-conflict-utils";
import { cacheLife, cacheTag } from "next/cache";
import { CourseWithRelations, scheduleInclude } from "./courses.type";

export type ScheduleInput = {
    dayOfWeek: DayOfWeek;
    timeSlotId: string;
    teacherId?: string | null;
    assistantIds?: string[];
    roomId?: string | null;
};

function buildScheduleCreateData(schedules: ScheduleInput[]) {
    return schedules.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        timeSlotId: s.timeSlotId,
        teacherId: s.teacherId || null,
        roomId: s.roomId || null,
        assistants:
            s.assistantIds && s.assistantIds.length > 0
                ? {
                      create: s.assistantIds.map((assistantId) => ({ assistantId })),
                  }
                : undefined,
    }));
}

function toScheduleSlot(
    schedule: ScheduleInput,
    courseRoomId: string | null,
): ScheduleSlot {
    return {
        dayOfWeek: schedule.dayOfWeek,
        timeSlotId: schedule.timeSlotId,
        teacherId: schedule.teacherId ?? null,
        roomId: resolveScheduleRoomId(schedule.roomId, courseRoomId),
    };
}

async function assertNoScheduleConflicts(
    periodId: string,
    courseRoomId: string | null,
    schedules: ScheduleInput[],
    excludeCourseId?: string,
): Promise<void> {
    if (schedules.length === 0) return;

    const normalized = schedules.map((schedule) => toScheduleSlot(schedule, courseRoomId));

    for (let i = 0; i < normalized.length; i++) {
        const othersInBatch = normalized.filter((_, index) => index !== i);
        const batchConflict = findScheduleConflictInList(normalized[i], othersInBatch);
        if (batchConflict) {
            throw new Error(batchConflict);
        }
    }

    const existingSchedules = await prisma.schedule.findMany({
        where: {
            course: { periodId },
            ...(excludeCourseId ? { courseId: { not: excludeCourseId } } : {}),
        },
        select: {
            dayOfWeek: true,
            timeSlotId: true,
            teacherId: true,
            roomId: true,
            course: {
                select: {
                    roomId: true,
                },
            },
        },
    });

    const existingSlots: ScheduleSlot[] = existingSchedules.map((schedule) => ({
        dayOfWeek: schedule.dayOfWeek,
        timeSlotId: schedule.timeSlotId,
        teacherId: schedule.teacherId,
        roomId: resolveScheduleRoomId(schedule.roomId, schedule.course.roomId),
    }));

    for (const slot of normalized) {
        const conflict = findScheduleConflictInList(slot, existingSlots);
        if (conflict) {
            throw new Error(conflict);
        }
    }
}

/**
 * Lista todas as turmas de um período específico.
 * Inclui dados da disciplina e da sala para exibição na listagem.
 */
export async function getCoursesByPeriodId(periodId: string) {
    "use cache";
    cacheLife("max");
    cacheTag(`period:${periodId}:courses`);

    return await prisma.course.findMany({
        where: {
            periodId,
        },
        include: {
            subject: true,
            room: {
                include: {
                    campus: true,
                },
            },
            classGroup: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
        orderBy: [
            { classGroup: { name: "asc" } },
            { name: "asc" },
            { createdAt: "desc" },
        ],
    });
}

/**
 * Lista todas as disciplinas (ofertas) de uma turma física específica.
 */
export async function getCoursesByClassGroupId(classGroupId: string) {
    "use cache";
    cacheLife("max");
    cacheTag(`class-group:${classGroupId}:courses`);

    return await prisma.course.findMany({
        where: {
            classGroupId,
        },
        include: {
            subject: true,
            room: {
                include: {
                    campus: true,
                },
            },
            classGroup: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}

/**
 * Busca uma turma específica pelo período e código.
 */
export async function getCourseByPeriodIdAndCode(periodId: string, code: string): Promise<CourseWithRelations | null> {
    return await prisma.course.findUnique({
        where: {
            periodId_code: {
                periodId,
                code,
            },
        },
        include: {
            subject: true,
            room: {
                include: {
                    campus: true,
                },
            },
            period: true,
            schedules: {
                include: scheduleInclude,
                orderBy: [
                    { dayOfWeek: "asc" },
                    { timeSlot: { startTime: "asc" } },
                ],
            },
        },
    });
}

/**
 * Mapeia erros de unicidade (P2002) do Schedule para mensagens amigáveis.
 * As constraints do Prisma incluem o nome dos campos violados.
 */
function mapScheduleUniqueError(error: Prisma.PrismaClientKnownRequestError): string {
    const target = error.meta?.target as string[] | undefined;
    const targetStr = target?.join(",") ?? "";

    if (targetStr.includes("course_id")) {
        return "Esta turma já possui uma aula cadastrada neste dia e horário.";
    }

    return "Conflito de horário detectado. Verifique os horários selecionados.";
}

/**
 * Cria uma nova turma com horários opcionais.
 */
export async function createCourse(data: {
    name: string;
    code: string;
    periodId: string;
    subjectId: string;
    roomId?: string | null;
    shift: Shift;
    classGroupId?: string | null;
    schedules?: ScheduleInput[];
}): Promise<Course> {
    try {
        await assertNoScheduleConflicts(
            data.periodId,
            data.roomId ?? null,
            data.schedules ?? [],
        );

        const course = await prisma.course.create({
            data: {
                name: data.name,
                code: data.code,
                periodId: data.periodId,
                subjectId: data.subjectId,
                roomId: data.roomId || null,
                shift: data.shift,
                classGroupId: data.classGroupId || null,
                schedules: data.schedules && data.schedules.length > 0
                    ? {
                        create: buildScheduleCreateData(data.schedules),
                    }
                    : undefined,
            },
        });
        return course;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new Error(mapScheduleUniqueError(error));
        }
        throw error;
    }
}

/**
 * Atualiza os dados de uma turma e seus horários.
 * Usa deleteMany + createMany para substituir os schedules.
 */
export async function updateCourse(
    id: string,
    data: {
        name: string;
        code: string;
        subjectId: string;
        roomId?: string | null;
        shift: Shift;
        classGroupId?: string | null;
        schedules?: ScheduleInput[];
    },
): Promise<Course> {
    try {
        const currentCourse = await prisma.course.findUnique({
            where: { id },
            select: { periodId: true },
        });

        if (!currentCourse) {
            throw new Error("Turma não encontrada.");
        }

        await assertNoScheduleConflicts(
            currentCourse.periodId,
            data.roomId ?? null,
            data.schedules ?? [],
            id,
        );

        const course = await prisma.$transaction(async (tx) => {
            // Remove todos os schedules antigos (assistants cascade)
            await tx.schedule.deleteMany({
                where: { courseId: id },
            });

            // Atualiza a turma e cria novos schedules
            return await tx.course.update({
                where: { id },
                data: {
                    name: data.name,
                    code: data.code,
                    subjectId: data.subjectId,
                    roomId: data.roomId || null,
                    shift: data.shift,
                    classGroupId: data.classGroupId || null,
                    schedules: data.schedules && data.schedules.length > 0
                        ? {
                            create: buildScheduleCreateData(data.schedules),
                        }
                        : undefined,
                },
            });
        });
        return course;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new Error(mapScheduleUniqueError(error));
            }
            if (error.code === "P2025") {
                throw new Error("Turma não encontrada.");
            }
        }
        throw error;
    }
}

/**
 * Deleta uma turma.
 */
export async function deleteCourse(id: string): Promise<Course> {
    try {
        const course = await prisma.course.delete({
            where: {
                id,
            },
        });
        return course;
    } catch (error) {
        const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        if ((error as { code?: string })?.code === "P2003" || msg.includes("foreign key constraint") || msg.includes("violates restrict")) {
            throw new Error("Não é possível excluir a turma porque existem matrículas, aulas ou atividades vinculadas a ela.");
        }
        if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
            throw new Error("Turma não encontrada.");
        }
        throw error;
    }
}
