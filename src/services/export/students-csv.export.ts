import { serializeCsv } from "@/lib/export/csv";
import prisma from "@/lib/prisma";
import {
    STUDENTS_EXPORT_COLUMNS,
    type StudentExportRow,
} from "@/services/export/students-export.config";

export type { StudentExportRow, PeriodStudentExportRow } from "@/services/export/students-export.config";
export {
    STUDENTS_EXPORT_COLUMNS,
    PERIOD_STUDENTS_EXPORT_COLUMNS,
    PERIOD_STUDENTS_CSV_COLUMNS,
} from "@/services/export/students-export.config";

export async function getStudentsByPeriodForExport(periodId: string): Promise<StudentExportRow[]> {
    const studentsPeriods = await prisma.studentPeriod.findMany({
        where: {
            periodId,
        },
        select: {
            student: {
                select: {
                    name: true,
                    lunaId: true,
                    cpf: true,
                    studentPhone: true,
                    email: true,
                    birthDate: true,
                },
            },
        },
        orderBy: {
            student: {
                name: "asc",
            },
        },
    });

    return studentsPeriods.map((studentPeriod) => studentPeriod.student);
}

export async function getStudentsByClassGroupForExport(classGroupId: string): Promise<StudentExportRow[]> {
    return prisma.student.findMany({
        where: {
            enrollments: {
                some: {
                    course: {
                        classGroupId,
                    },
                },
            },
        },
        select: {
            name: true,
            lunaId: true,
            cpf: true,
            studentPhone: true,
            email: true,
            birthDate: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function buildPeriodStudentsCsv(periodId: string): Promise<string> {
    const rows = await getStudentsByPeriodForExport(periodId);
    return serializeCsv(rows, STUDENTS_EXPORT_COLUMNS);
}

export async function buildClassGroupStudentsCsv(classGroupId: string): Promise<string> {
    const rows = await getStudentsByClassGroupForExport(classGroupId);
    return serializeCsv(rows, STUDENTS_EXPORT_COLUMNS);
}
