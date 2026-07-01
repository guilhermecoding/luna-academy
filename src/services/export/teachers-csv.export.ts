import { serializeCsv } from "@/lib/export/csv";
import { isTeacherSystemAccessEnabled } from "@/lib/schedule-teacher-utils";
import prisma from "@/lib/prisma";
import {
    COURSE_TEACHERS_EXPORT_COLUMNS,
    TEACHERS_EXPORT_COLUMNS,
    teacherExportSelect,
    type CourseTeacherExportRow,
    type TeacherExportRow,
} from "@/services/export/teachers-export.config";

export type {
    CourseTeacherExportRow,
    TeacherExportRow,
} from "@/services/export/teachers-export.config";

export {
    COURSE_TEACHERS_EXPORT_COLUMNS,
    TEACHERS_EXPORT_COLUMNS,
} from "@/services/export/teachers-export.config";

const periodTeacherScope = (periodId: string) => ({
    isTeacher: true,
    OR: [
        { schedules: { some: { course: { periodId } } } },
        { scheduleAssistants: { some: { schedule: { course: { periodId } } } } },
    ],
});

const classGroupTeacherScope = (classGroupId: string) => ({
    isTeacher: true,
    OR: [
        { schedules: { some: { course: { classGroupId } } } },
        { scheduleAssistants: { some: { schedule: { course: { classGroupId } } } } },
    ],
});

export async function getAllTeachersForExport(): Promise<TeacherExportRow[]> {
    return prisma.user.findMany({
        where: { isTeacher: true },
        select: teacherExportSelect,
        orderBy: { name: "asc" },
    });
}

export async function getTeachersByPeriodForExport(periodId: string): Promise<TeacherExportRow[]> {
    return prisma.user.findMany({
        where: periodTeacherScope(periodId),
        select: teacherExportSelect,
        orderBy: { name: "asc" },
    });
}

export async function getTeachersByClassGroupForExport(classGroupId: string): Promise<TeacherExportRow[]> {
    return prisma.user.findMany({
        where: classGroupTeacherScope(classGroupId),
        select: teacherExportSelect,
        orderBy: { name: "asc" },
    });
}

export async function getTeachersByCourseForExport(courseId: string): Promise<CourseTeacherExportRow[]> {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
            schedules: {
                select: {
                    teacher: { select: { ...teacherExportSelect, id: true, isActive: true } },
                    assistants: {
                        select: {
                            assistant: { select: { ...teacherExportSelect, id: true, isActive: true } },
                        },
                    },
                },
            },
        },
    });

    if (!course) {
        return [];
    }

    const rows = new Map<string, CourseTeacherExportRow>();

    for (const schedule of course.schedules) {
        if (schedule.teacher && isTeacherSystemAccessEnabled(schedule.teacher)) {
            const existing = rows.get(schedule.teacher.id);
            if (!existing) {
                rows.set(schedule.teacher.id, {
                    name: schedule.teacher.name,
                    lunaId: schedule.teacher.lunaId,
                    cpf: schedule.teacher.cpf,
                    phone: schedule.teacher.phone,
                    email: schedule.teacher.email,
                    birthDate: schedule.teacher.birthDate,
                    role: "Titular",
                });
            } else if (existing.role !== "Titular") {
                rows.set(schedule.teacher.id, { ...existing, role: "Titular" });
            }
        }

        for (const { assistant } of schedule.assistants) {
            if (!assistant || !isTeacherSystemAccessEnabled(assistant)) {
                continue;
            }

            if (!rows.has(assistant.id)) {
                rows.set(assistant.id, {
                    name: assistant.name,
                    lunaId: assistant.lunaId,
                    cpf: assistant.cpf,
                    phone: assistant.phone,
                    email: assistant.email,
                    birthDate: assistant.birthDate,
                    role: "Assistente",
                });
            }
        }
    }

    return Array.from(rows.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function buildAllTeachersCsv(): Promise<string> {
    const rows = await getAllTeachersForExport();
    return serializeCsv(rows, TEACHERS_EXPORT_COLUMNS);
}

export async function buildPeriodTeachersCsv(periodId: string): Promise<string> {
    const rows = await getTeachersByPeriodForExport(periodId);
    return serializeCsv(rows, TEACHERS_EXPORT_COLUMNS);
}

export async function buildClassGroupTeachersCsv(classGroupId: string): Promise<string> {
    const rows = await getTeachersByClassGroupForExport(classGroupId);
    return serializeCsv(rows, TEACHERS_EXPORT_COLUMNS);
}

export async function buildCourseTeachersCsv(courseId: string): Promise<string> {
    const rows = await getTeachersByCourseForExport(courseId);
    return serializeCsv(rows, COURSE_TEACHERS_EXPORT_COLUMNS);
}
