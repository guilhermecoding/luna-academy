import {
    StudentsListPdfDocument,
    type StudentsListPdfDocumentProps,
} from "@/lib/export/pdf/students-list-document";

export type PeriodStudentsPdfDocumentProps = {
    programName: string;
    periodName: string;
    generatedAt: string;
    rows: StudentsListPdfDocumentProps["rows"];
};

/** @deprecated Use StudentsListPdfDocument */
export function PeriodStudentsPdfDocument({
    programName,
    periodName,
    generatedAt,
    rows,
}: PeriodStudentsPdfDocumentProps) {
    return (
        <StudentsListPdfDocument
            title={`Alunos de ${periodName}`}
            subtitle={programName}
            generatedAt={generatedAt}
            rows={rows}
        />
    );
}
