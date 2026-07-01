import { calculateAge } from "@/lib/date-utils";
import type { ExportColumnDef } from "@/lib/export/columns";
import { maskCPF, maskPhone } from "@/lib/masks";

export type TeacherExportRow = {
    name: string;
    lunaId: string | null;
    cpf: string;
    phone: string;
    email: string;
    birthDate: Date | string;
};

export const TEACHERS_EXPORT_COLUMNS: ExportColumnDef<TeacherExportRow>[] = [
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
        key: "phone",
        header: "Telefone",
        width: "14%",
        value: (row) => maskPhone(row.phone),
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

const teacherExportSelect = {
    name: true,
    lunaId: true,
    cpf: true,
    phone: true,
    email: true,
    birthDate: true,
} as const;

export { teacherExportSelect };
