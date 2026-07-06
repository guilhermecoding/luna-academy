import { formatExportGeneratedAt } from "@/lib/export/format-generated-at";
import { TeachersListPdfDocument } from "@/lib/export/pdf/teachers-list-document";
import { renderToBuffer } from "@react-pdf/renderer";
import {
    TEACHERS_EXPORT_COLUMNS,
    getAllTeachersForExport,
    getTeachersByPeriodForExport,
} from "@/services/export/teachers-csv.export";

export type PeriodTeachersPdfMeta = {
    periodId: string;
    periodName: string;
    programName: string;
};

export async function buildAllTeachersPdf(): Promise<Buffer> {
    const rows = await getAllTeachersForExport();
    const generatedAt = formatExportGeneratedAt();

    const buffer = await renderToBuffer(
        <TeachersListPdfDocument
            title="Professores"
            subtitle="Equipe docente"
            generatedAt={generatedAt}
            rows={rows}
            columns={TEACHERS_EXPORT_COLUMNS}
        />,
    );

    return Buffer.from(buffer);
}

export async function buildPeriodTeachersPdf(meta: PeriodTeachersPdfMeta): Promise<Buffer> {
    const rows = await getTeachersByPeriodForExport(meta.periodId);
    const generatedAt = formatExportGeneratedAt();

    const buffer = await renderToBuffer(
        <TeachersListPdfDocument
            title={`Professores de ${meta.periodName}`}
            subtitle={meta.programName}
            generatedAt={generatedAt}
            rows={rows}
            columns={TEACHERS_EXPORT_COLUMNS}
        />,
    );

    return Buffer.from(buffer);
}
