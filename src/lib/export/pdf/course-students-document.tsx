import {
    StudentsListPdfDocument,
    type StudentsListPdfDocumentProps,
} from "@/lib/export/pdf/students-list-document";
import type { CourseTeachersExport } from "@/services/export/course-students.export";

export type CourseStudentsPdfDocumentProps = {
    courseName: string;
    programName: string;
    classGroupName: string;
    periodName: string;
    generatedAt: string;
    rows: StudentsListPdfDocumentProps["rows"];
    teachers: CourseTeachersExport;
};

export function CourseStudentsPdfDocument({
    courseName,
    programName,
    classGroupName,
    periodName,
    generatedAt,
    rows,
    teachers,
}: CourseStudentsPdfDocumentProps) {
    return (
        <StudentsListPdfDocument
            title={`Alunos de ${courseName}`}
            subtitle={`${programName} · ${classGroupName} · ${periodName}`}
            generatedAt={generatedAt}
            rows={rows}
            teachers={teachers}
        />
    );
}
