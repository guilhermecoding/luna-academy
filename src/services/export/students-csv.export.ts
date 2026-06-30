import { serializeCsv } from "@/lib/export/csv";
import prisma from "@/lib/prisma";
import {
    PERIOD_STUDENTS_EXPORT_COLUMNS,
    type PeriodStudentExportRow,
} from "@/services/export/students-export.config";

export type { PeriodStudentExportRow } from "@/services/export/students-export.config";
export {
    PERIOD_STUDENTS_EXPORT_COLUMNS,
    PERIOD_STUDENTS_CSV_COLUMNS,
} from "@/services/export/students-export.config";

export async function getStudentsByPeriodForExport(periodId: string): Promise<PeriodStudentExportRow[]> {
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

export async function buildPeriodStudentsCsv(periodId: string): Promise<string> {
    const rows = await getStudentsByPeriodForExport(periodId);
    return serializeCsv(rows, PERIOD_STUDENTS_EXPORT_COLUMNS);
}
