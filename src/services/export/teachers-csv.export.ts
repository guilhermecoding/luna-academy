import { serializeCsv } from "@/lib/export/csv";
import prisma from "@/lib/prisma";
import {
    TEACHERS_EXPORT_COLUMNS,
    teacherExportSelect,
    type TeacherExportRow,
} from "@/services/export/teachers-export.config";

export type { TeacherExportRow } from "@/services/export/teachers-export.config";

export { TEACHERS_EXPORT_COLUMNS } from "@/services/export/teachers-export.config";

const periodTeacherScope = (periodId: string) => ({
    isTeacher: true,
    OR: [
        { schedules: { some: { course: { periodId } } } },
        { scheduleAssistants: { some: { schedule: { course: { periodId } } } } },
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

export async function buildAllTeachersCsv(): Promise<string> {
    const rows = await getAllTeachersForExport();
    return serializeCsv(rows, TEACHERS_EXPORT_COLUMNS);
}

export async function buildPeriodTeachersCsv(periodId: string): Promise<string> {
    const rows = await getTeachersByPeriodForExport(periodId);
    return serializeCsv(rows, TEACHERS_EXPORT_COLUMNS);
}
