import prisma from "@/lib/prisma";
import { DayOfWeek, Prisma } from "@/generated/prisma/client";
import { cacheLife, cacheTag } from "next/cache";
import { expandScheduleDates } from "@/lib/lesson-schedule-utils";

type TransactionClient = Prisma.TransactionClient;

/**
 * Retorna as aulas de uma disciplina (course) ordenadas por data crescente,
 * incluindo contagem de presentes/total de registros de presença.
 */
export async function getLessonsByCourseId(courseId: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`course:${courseId}:lessons`);

    return await prisma.lesson.findMany({
        where: { courseId },
        include: {
            teacher: {
                select: { id: true, name: true },
            },
            timeSlot: {
                select: { id: true, name: true, startTime: true, endTime: true },
            },
            _count: {
                select: { attendances: true },
            },
        },
        orderBy: { date: "asc" },
    });
}

export type LessonListItem = Awaited<ReturnType<typeof getLessonsByCourseId>>[number];

/**
 * Retorna uma aula específica pelo ID com seus dados completos.
 */
export async function getLessonById(lessonId: string) {
    return await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
            course: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    classGroupId: true,
                },
            },
            teacher: {
                select: { id: true, name: true },
            },
            timeSlot: {
                select: { id: true, name: true, startTime: true, endTime: true },
            },
        },
    });
}

/**
 * Retorna a contagem de aulas de uma disciplina.
 */
export async function getLessonsCountByCourseId(courseId: string): Promise<number> {
    "use cache";
    cacheLife("minutes");
    cacheTag(`course:${courseId}:lessons-count`);

    return await prisma.lesson.count({ where: { courseId } });
}

/**
 * Retorna os registros de presença de uma aula.
 * Inclui dados do aluno e indica se o aluno foi desvinculado da disciplina.
 */
export async function getAttendancesByLessonId(lessonId: string, courseId: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`lesson:${lessonId}:attendances`);

    const [attendances, enrollments] = await Promise.all([
        prisma.attendance.findMany({
            where: { lessonId },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        cpf: true,
                        lunaId: true,
                        email: true,
                        genre: true,
                        birthDate: true,
                    },
                },
            },
            orderBy: { student: { name: "asc" } },
        }),
        prisma.enrollment.findMany({
            where: { courseId },
            select: { studentId: true },
        }),
    ]);

    const enrolledIds = new Set(enrollments.map((e) => e.studentId));

    return attendances.map((attendance) => ({
        ...attendance,
        isUnlinked: !enrolledIds.has(attendance.studentId),
    }));
}

export type AttendanceWithStudent = Awaited<ReturnType<typeof getAttendancesByLessonId>>[number];

/**
 * Retorna estatísticas de presença de uma aula.
 */
export async function getAttendanceStatsByLessonId(lessonId: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`lesson:${lessonId}:attendances`);

    const [total, present] = await Promise.all([
        prisma.attendance.count({ where: { lessonId } }),
        prisma.attendance.count({ where: { lessonId, isPresent: true } }),
    ]);

    return { total, present, absent: total - present };
}

/**
 * Cria registros de presença faltantes para alunos em aulas já existentes.
 * Usado ao enturmar alunos após aulas registradas (default: ausente).
 */
export async function backfillAttendancesForStudents(
    tx: TransactionClient,
    courseIds: string[],
    studentIds: string[],
    isPresent = false,
) {
    if (courseIds.length === 0 || studentIds.length === 0) {
        return [];
    }

    const lessons = await tx.lesson.findMany({
        where: { courseId: { in: courseIds } },
        select: { id: true },
    });

    if (lessons.length === 0) {
        return [];
    }

    await tx.attendance.createMany({
        data: lessons.flatMap((lesson) =>
            studentIds.map((studentId) => ({
                lessonId: lesson.id,
                studentId,
                isPresent,
            })),
        ),
        skipDuplicates: true,
    });

    return lessons.map((l) => l.id);
}

/**
 * Retorna os IDs das aulas de um conjunto de disciplinas (para invalidação de cache).
 */
export async function getLessonIdsByCourseIds(courseIds: string[]) {
    if (courseIds.length === 0) {
        return [];
    }

    const lessons = await prisma.lesson.findMany({
        where: { courseId: { in: courseIds } },
        select: { id: true },
    });

    return lessons.map((l) => l.id);
}

/**
 * Marca aulas como removidas da grade antes de apagar os schedules.
 */
export async function markLessonsRemovedFromSchedules(
    tx: TransactionClient,
    scheduleIds: string[],
) {
    if (scheduleIds.length === 0) return;

    await tx.lesson.updateMany({
        where: { scheduleId: { in: scheduleIds } },
        data: {
            scheduleRemovedAt: new Date(),
            scheduleId: null,
        },
    });
}

/**
 * Gera aulas faltantes a partir dos schedules ativos no intervalo do período.
 * Não cria attendances (sob demanda na abertura da chamada).
 * Religa aulas órfãs quando o mesmo timeSlot volta à grade.
 */
export async function syncLessonsFromSchedules(
    tx: TransactionClient,
    courseId: string,
    periodStart: Date,
    periodEnd: Date,
): Promise<{ created: number; relinked: number }> {
    const schedules = await tx.schedule.findMany({
        where: { courseId },
        select: {
            id: true,
            dayOfWeek: true,
            timeSlotId: true,
            teacherId: true,
        },
    });

    if (schedules.length === 0) {
        return { created: 0, relinked: 0 };
    }

    const existingLessons = await tx.lesson.findMany({
        where: {
            courseId,
            timeSlotId: { in: schedules.map((s) => s.timeSlotId) },
        },
        select: {
            id: true,
            date: true,
            timeSlotId: true,
            scheduleId: true,
            scheduleRemovedAt: true,
        },
    });

    const byDateSlot = new Map<string, (typeof existingLessons)[number]>(
        existingLessons.map((l) => {
            const dateKey = new Date(l.date).toISOString().split("T")[0];
            return [`${dateKey}_${l.timeSlotId}`, l];
        }),
    );

    const toCreate: {
        courseId: string;
        date: Date;
        topic: string;
        scheduleId: string;
        timeSlotId: string;
        teacherId: string | null;
    }[] = [];

    const toRelink: { id: string; scheduleId: string; teacherId: string | null }[] = [];

    for (const schedule of schedules) {
        const dates = expandScheduleDates(
            schedule.dayOfWeek as DayOfWeek,
            periodStart,
            periodEnd,
        );

        for (const date of dates) {
            const dateKey = date.toISOString().split("T")[0];
            const key = `${dateKey}_${schedule.timeSlotId}`;
            const existing = byDateSlot.get(key);

            if (!existing) {
                toCreate.push({
                    courseId,
                    date,
                    topic: "Aula",
                    scheduleId: schedule.id,
                    timeSlotId: schedule.timeSlotId,
                    teacherId: schedule.teacherId,
                });
                continue;
            }

            if (
                existing.scheduleRemovedAt != null
                || existing.scheduleId !== schedule.id
            ) {
                toRelink.push({
                    id: existing.id,
                    scheduleId: schedule.id,
                    teacherId: schedule.teacherId,
                });
            }
        }
    }

    let created = 0;
    if (toCreate.length > 0) {
        const result = await tx.lesson.createMany({
            data: toCreate,
            skipDuplicates: true,
        });
        created = result.count;
    }

    let relinked = 0;
    for (const item of toRelink) {
        await tx.lesson.update({
            where: { id: item.id },
            data: {
                scheduleId: item.scheduleId,
                teacherId: item.teacherId,
                scheduleRemovedAt: null,
            },
        });
        relinked += 1;
    }

    return { created, relinked };
}

/**
 * Garante registros de presença para todos os matriculados na abertura da chamada.
 */
export async function ensureAttendancesForLesson(
    lessonId: string,
    courseId: string,
) {
    const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        select: { studentId: true },
    });

    if (enrollments.length === 0) return;

    await prisma.attendance.createMany({
        data: enrollments.map((e) => ({
            lessonId,
            studentId: e.studentId,
            isPresent: true,
        })),
        skipDuplicates: true,
    });
}

/**
 * Cria uma nova aula e gera registros de presença para todos os alunos matriculados
 * na disciplina. O default de isPresent é true (conforme schema.prisma).
 */
export async function createLesson(data: {
    courseId: string;
    date: Date;
    topic: string;
    teacherId?: string | null;
    timeSlotId?: string | null;
    scheduleId?: string | null;
}) {
    return await prisma.$transaction(async (tx) => {
        const lesson = await tx.lesson.create({
            data: {
                courseId: data.courseId,
                date: data.date,
                topic: data.topic,
                teacherId: data.teacherId || null,
                timeSlotId: data.timeSlotId || null,
                scheduleId: data.scheduleId || null,
                scheduleRemovedAt: null,
            },
        });

        // Buscar todos os alunos matriculados nesta disciplina
        const enrollments = await tx.enrollment.findMany({
            where: { courseId: data.courseId },
            select: { studentId: true },
        });

        // Criar registros de presença para todos (isPresent = true por default no DB, mas garantimos explicitamente)
        if (enrollments.length > 0) {
            await tx.attendance.createMany({
                data: enrollments.map((e) => ({
                    lessonId: lesson.id,
                    studentId: e.studentId,
                    isPresent: true,
                })),
            });
        }

        return lesson;
    });
}

/**
 * Atualiza os dados de uma aula.
 */
export async function updateLesson(
    lessonId: string,
    data: {
        date?: Date;
        topic?: string;
        teacherId?: string | null;
        timeSlotId?: string | null;
        scheduleId?: string | null;
        scheduleRemovedAt?: Date | null;
    },
) {
    return await prisma.lesson.update({
        where: { id: lessonId },
        data,
    });
}

/**
 * Remove uma aula e todos os seus registros de presença.
 */
export async function deleteLesson(lessonId: string) {
    return await prisma.$transaction(async (tx) => {
        await tx.attendance.deleteMany({ where: { lessonId } });
        return await tx.lesson.delete({ where: { id: lessonId } });
    });
}

/**
 * Atualiza o registro de presença de um aluno em uma aula.
 */
export async function updateAttendance(
    attendanceId: string,
    data: { isPresent: boolean; observation?: string | null },
) {
    return await prisma.attendance.update({
        where: { id: attendanceId },
        data,
    });
}

/**
 * Atualiza a presença em lote para uma aula inteira.
 */
export async function bulkUpdateAttendance(
    lessonId: string,
    updates: { id: string; isPresent: boolean; observation?: string | null }[],
) {
    return await prisma.$transaction(async (tx) => {
        for (const u of updates) {
            await tx.attendance.update({
                where: { id: u.id },
                data: {
                    isPresent: u.isPresent,
                    observation: u.observation ?? undefined,
                },
            });
        }

        await tx.lesson.update({
            where: { id: lessonId },
            data: { attendanceUpdatedAt: new Date() },
        });
    });
}
