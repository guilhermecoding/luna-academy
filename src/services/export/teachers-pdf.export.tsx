import { formatExportGeneratedAt } from "@/lib/export/format-generated-at";
import { TeachersListPdfDocument } from "@/lib/export/pdf/teachers-list-document";
import { renderToBuffer } from "@react-pdf/renderer";
import {
    COURSE_TEACHERS_EXPORT_COLUMNS,
    TEACHERS_EXPORT_COLUMNS,
    getAllTeachersForExport,
    getTeachersByClassGroupForExport,
    getTeachersByCourseForExport,
    getTeachersByPeriodForExport,
} from "@/services/export/teachers-csv.export";

export type PeriodTeachersPdfMeta = {
    periodId: string;
    periodName: string;
    programName: string;
};

export type ClassGroupTeachersPdfMeta = {
    classGroupId: string;
    classGroupName: string;
    periodName: string;
    programName: string;
};

export type CourseTeachersPdfMeta = {
    courseId: string;
    courseName: string;
    classGroupName: string;
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

export async function buildClassGroupTeachersPdf(meta: ClassGroupTeachersPdfMeta): Promise<Buffer> {
    const rows = await getTeachersByClassGroupForExport(meta.classGroupId);
    const generatedAt = formatExportGeneratedAt();

    const buffer = await renderToBuffer(
        <TeachersListPdfDocument
            title={`Professores da turma ${meta.classGroupName}`}
            subtitle={`${meta.programName} · ${meta.periodName}`}
            generatedAt={generatedAt}
            rows={rows}
            columns={TEACHERS_EXPORT_COLUMNS}
        />,
    );

    return Buffer.from(buffer);
}

export async function buildCourseTeachersPdf(meta: CourseTeachersPdfMeta): Promise<Buffer> {
    const rows = await getTeachersByCourseForExport(meta.courseId);
    const generatedAt = formatExportGeneratedAt();

    const buffer = await renderToBuffer(
        <TeachersListPdfDocument
            title={`Professores de ${meta.courseName}`}
            subtitle={`${meta.programName} · ${meta.classGroupName} · ${meta.periodName}`}
            generatedAt={generatedAt}
            rows={rows}
            columns={COURSE_TEACHERS_EXPORT_COLUMNS}
        />,
    );

    return Buffer.from(buffer);
}
