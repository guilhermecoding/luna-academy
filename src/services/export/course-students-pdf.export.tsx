import { formatExportGeneratedAt } from "@/lib/export/format-generated-at";
import { CourseStudentsPdfDocument } from "@/lib/export/pdf/course-students-document";
import { renderToBuffer } from "@react-pdf/renderer";
import type { CourseStudentsExportMeta } from "@/services/export/course-students.export";
import { getStudentsByCourseForExport } from "@/services/export/course-students.export";

export async function buildCourseStudentsPdf(meta: CourseStudentsExportMeta): Promise<Buffer> {
    const rows = await getStudentsByCourseForExport(meta.courseId);
    const generatedAt = formatExportGeneratedAt();

    const buffer = await renderToBuffer(
        <CourseStudentsPdfDocument
            courseName={meta.courseName}
            programName={meta.programName}
            classGroupName={meta.classGroupName}
            periodName={meta.periodName}
            generatedAt={generatedAt}
            rows={rows}
            teachers={meta.teachers}
        />,
    );

    return Buffer.from(buffer);
}
