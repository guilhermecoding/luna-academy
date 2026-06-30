import { calculateAge } from "@/lib/date-utils";
import { type CsvColumnDef, serializeCsv } from "@/lib/export/csv";
import { maskCPF, maskPhone } from "@/lib/masks";
import prisma from "@/lib/prisma";

export type PeriodStudentExportRow = {
    name: string;
    lunaId: string | null;
    cpf: string;
    studentPhone: string;
    email: string;
    birthDate: Date;
};

export const PERIOD_STUDENTS_CSV_COLUMNS: CsvColumnDef<PeriodStudentExportRow>[] = [
    {
        key: "name",
        header: "Nome",
        value: (row) => row.name,
    },
    {
        key: "lunaId",
        header: "Matrícula",
        value: (row) => row.lunaId ?? "---",
    },
    {
        key: "cpf",
        header: "CPF",
        value: (row) => maskCPF(row.cpf),
    },
    {
        key: "studentPhone",
        header: "Telefone",
        value: (row) => maskPhone(row.studentPhone),
    },
    {
        key: "email",
        header: "E-mail",
        value: (row) => row.email,
    },
    {
        key: "age",
        header: "Idade",
        value: (row) => calculateAge(row.birthDate),
    },
];

async function getStudentsByPeriodForExport(periodId: string): Promise<PeriodStudentExportRow[]> {
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
    return serializeCsv(rows, PERIOD_STUDENTS_CSV_COLUMNS);
}
