import { StudentsListPdfDocument } from "@/lib/export/pdf/students-list-document";
import { renderToBuffer } from "@react-pdf/renderer";
import {
    getStudentsByClassGroupForExport,
    getStudentsByPeriodForExport,
} from "@/services/export/students-csv.export";

function formatGeneratedAt() {
    return new Date().toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export type PeriodStudentsPdfMeta = {
    periodId: string;
    periodName: string;
    programName: string;
};

export type ClassGroupStudentsPdfMeta = {
    classGroupId: string;
    classGroupName: string;
    periodName: string;
    programName: string;
};

export async function buildPeriodStudentsPdf(meta: PeriodStudentsPdfMeta): Promise<Buffer> {
    const rows = await getStudentsByPeriodForExport(meta.periodId);
    const generatedAt = formatGeneratedAt();

    const buffer = await renderToBuffer(
        <StudentsListPdfDocument
            title={`Alunos de ${meta.periodName}`}
            subtitle={meta.programName}
            generatedAt={generatedAt}
            rows={rows}
        />,
    );

    return Buffer.from(buffer);
}

export async function buildClassGroupStudentsPdf(meta: ClassGroupStudentsPdfMeta): Promise<Buffer> {
    const rows = await getStudentsByClassGroupForExport(meta.classGroupId);
    const generatedAt = formatGeneratedAt();

    const buffer = await renderToBuffer(
        <StudentsListPdfDocument
            title={`Alunos da turma ${meta.classGroupName}`}
            subtitle={`${meta.programName} · ${meta.periodName}`}
            generatedAt={generatedAt}
            rows={rows}
        />,
    );

    return Buffer.from(buffer);
}
