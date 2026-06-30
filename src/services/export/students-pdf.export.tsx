import { formatExportGeneratedAt } from "@/lib/export/format-generated-at";
import { ClassGroupStudentsPdfDocument } from "@/lib/export/pdf/class-group-students-document";
import { StudentsListPdfDocument } from "@/lib/export/pdf/students-list-document";
import { renderToBuffer } from "@react-pdf/renderer";
import {
    getStudentsByClassGroupForExport,
    getStudentsByPeriodForExport,
} from "@/services/export/students-csv.export";

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
    const generatedAt = formatExportGeneratedAt();

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
    const generatedAt = formatExportGeneratedAt();

    const buffer = await renderToBuffer(
        <ClassGroupStudentsPdfDocument
            classGroupName={meta.classGroupName}
            programName={meta.programName}
            periodName={meta.periodName}
            generatedAt={generatedAt}
            rows={rows}
        />,
    );

    return Buffer.from(buffer);
}
