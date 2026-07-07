import { createCsvResponse } from "@/lib/export/csv";
import { createPdfResponse } from "@/lib/export/pdf";
import { requireTeacherCourseExportAccess } from "@/lib/teacher-period-guards";
import { getProgramBySlug } from "@/services/programs/programs.service";
import {
    buildCourseStudentsCsv,
    getCourseTeachersForExport,
} from "@/services/export/course-students.export";
import { buildCourseStudentsPdf } from "@/services/export/course-students-pdf.export";
import { NextResponse } from "next/server";

function guardErrorStatus(error: string): number {
    if (
        error === "Período não encontrado."
        || error === "Turma não encontrada."
        || error === "Disciplina não encontrada."
    ) {
        return 404;
    }

    if (error === "Não autorizado." || error === "Este período foi finalizado.") {
        return 403;
    }

    return 401;
}

export async function GET(
    request: Request,
    {
        params,
    }: { params: Promise<{ program: string; period: string; classGroup: string; course: string }> },
) {
    const { program, period, classGroup, course: courseCode } = await params;
    const authResult = await requireTeacherCourseExportAccess(
        program,
        period,
        classGroup,
        courseCode,
    );

    if (!authResult.ok) {
        return NextResponse.json(
            { error: authResult.error },
            { status: guardErrorStatus(authResult.error) },
        );
    }

    const { period: periodData, classGroup: classGroupData, course: courseData } = authResult.resolved;
    const programData = await getProgramBySlug(program);
    const programName = programData?.name ?? program;
    const teachers = getCourseTeachersForExport(courseData.schedules);
    const meta = {
        courseId: courseData.id,
        courseName: courseData.name,
        classGroupName: classGroupData.name,
        periodName: periodData.name,
        programName,
        teachers,
    };

    const format = new URL(request.url).searchParams.get("format");
    const dateSuffix = new Date().toISOString().slice(0, 10);

    if (format === "pdf") {
        const buffer = await buildCourseStudentsPdf(meta);
        return createPdfResponse(buffer, `alunos-disciplina-${courseCode}-${dateSuffix}.pdf`);
    }

    const csv = await buildCourseStudentsCsv(meta);
    return createCsvResponse(csv, `alunos-disciplina-${courseCode}-${dateSuffix}.csv`);
}
