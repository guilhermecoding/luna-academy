import { StudentsListPdfDocument } from "@/lib/export/pdf/students-list-document";
import { renderToBuffer } from "@react-pdf/renderer";
import type { CourseStudentsExportMeta } from "@/services/export/course-students.export";
import { getStudentsByCourseForExport } from "@/services/export/course-students.export";

function formatGeneratedAt() {
    return new Date().toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export async function buildCourseStudentsPdf(meta: CourseStudentsExportMeta): Promise<Buffer> {
    const rows = await getStudentsByCourseForExport(meta.courseId);
    const generatedAt = formatGeneratedAt();

    const buffer = await renderToBuffer(
        <StudentsListPdfDocument
            title={`Alunos de ${meta.courseName}`}
            subtitle={`${meta.programName} · ${meta.classGroupName} · ${meta.periodName}`}
            generatedAt={generatedAt}
            rows={rows}
            teachers={meta.teachers}
        />,
    );

    return Buffer.from(buffer);
}
