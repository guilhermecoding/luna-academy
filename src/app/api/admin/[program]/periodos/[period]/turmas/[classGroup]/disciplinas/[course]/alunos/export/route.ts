import { requireAdmin } from "@/lib/auth-guards";
import { createCsvResponse } from "@/lib/export/csv";
import { createPdfResponse } from "@/lib/export/pdf";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import {
    buildCourseStudentsCsv,
    getCourseTeachersForExport,
} from "@/services/export/course-students.export";
import { buildCourseStudentsPdf } from "@/services/export/course-students-pdf.export";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getProgramBySlug } from "@/services/programs/programs.service";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ program: string; period: string; classGroup: string; course: string }> },
) {
    const authResult = await requireAdmin();
    if (!authResult.ok) {
        return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { program, period, classGroup, course: courseCode } = await params;
    const periodData = await getPeriodByProgramAndSlug(program, period);

    if (!periodData) {
        return NextResponse.json({ error: "Período não encontrado" }, { status: 404 });
    }

    const classGroupData = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroup);

    if (!classGroupData) {
        return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 });
    }

    const courseData = await getCourseByPeriodIdAndCode(periodData.id, courseCode);

    if (!courseData || courseData.classGroupId !== classGroupData.id) {
        return NextResponse.json({ error: "Disciplina não encontrada" }, { status: 404 });
    }

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
