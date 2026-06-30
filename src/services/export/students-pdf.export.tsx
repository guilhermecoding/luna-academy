import { PeriodStudentsPdfDocument } from "@/lib/export/pdf/period-students-document";
import { renderToBuffer } from "@react-pdf/renderer";
import { getStudentsByPeriodForExport } from "@/services/export/students-csv.export";

export type PeriodStudentsPdfMeta = {
    periodId: string;
    periodName: string;
    programName: string;
};

export async function buildPeriodStudentsPdf(meta: PeriodStudentsPdfMeta): Promise<Buffer> {
    const rows = await getStudentsByPeriodForExport(meta.periodId);
    const generatedAt = new Date().toLocaleDateString("pt-BR");

    const buffer = await renderToBuffer(
        <PeriodStudentsPdfDocument
            programName={meta.programName}
            periodName={meta.periodName}
            generatedAt={generatedAt}
            rows={rows}
        />,
    );

    return Buffer.from(buffer);
}
