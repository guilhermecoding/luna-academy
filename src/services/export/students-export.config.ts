import { calculateAge } from "@/lib/date-utils";
import type { ExportColumnDef } from "@/lib/export/columns";
import { maskCPF, maskPhone } from "@/lib/masks";

export type PeriodStudentExportRow = {
    name: string;
    lunaId: string | null;
    cpf: string;
    studentPhone: string;
    email: string;
    birthDate: Date | string;
};

export const PERIOD_STUDENTS_EXPORT_COLUMNS: ExportColumnDef<PeriodStudentExportRow>[] = [
    {
        key: "name",
        header: "Nome",
        width: "24%",
        value: (row) => row.name,
    },
    {
        key: "lunaId",
        header: "Matrícula",
        width: "12%",
        value: (row) => row.lunaId ?? "---",
    },
    {
        key: "cpf",
        header: "CPF",
        width: "14%",
        value: (row) => maskCPF(row.cpf),
    },
    {
        key: "studentPhone",
        header: "Telefone",
        width: "14%",
        value: (row) => maskPhone(row.studentPhone),
    },
    {
        key: "email",
        header: "E-mail",
        width: "26%",
        value: (row) => row.email,
    },
    {
        key: "age",
        header: "Idade",
        width: "10%",
        value: (row) => calculateAge(row.birthDate),
    },
];

/** @deprecated Use PERIOD_STUDENTS_EXPORT_COLUMNS */
export const PERIOD_STUDENTS_CSV_COLUMNS = PERIOD_STUDENTS_EXPORT_COLUMNS;
