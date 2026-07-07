import {
    StudentsListPdfDocument,
    type StudentsListPdfDocumentProps,
} from "@/lib/export/pdf/students-list-document";

export type ClassGroupStudentsPdfDocumentProps = {
    classGroupName: string;
    programName: string;
    periodName: string;
    generatedAt: string;
    rows: StudentsListPdfDocumentProps["rows"];
};

export function ClassGroupStudentsPdfDocument({
    classGroupName,
    programName,
    periodName,
    generatedAt,
    rows,
}: ClassGroupStudentsPdfDocumentProps) {
    return (
        <StudentsListPdfDocument
            title={`Alunos da turma ${classGroupName}`}
            subtitle={`${programName} · ${periodName}`}
            generatedAt={generatedAt}
            rows={rows}
        />
    );
}
