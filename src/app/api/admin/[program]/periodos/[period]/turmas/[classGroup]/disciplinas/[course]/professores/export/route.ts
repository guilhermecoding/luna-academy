import { requireAdmin } from "@/lib/auth-guards";
import { createCsvResponse } from "@/lib/export/csv";
import { createPdfResponse } from "@/lib/export/pdf";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { buildCourseTeachersCsv } from "@/services/export/teachers-csv.export";
import { buildCourseTeachersPdf } from "@/services/export/teachers-pdf.export";
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
    const meta = {
        courseId: courseData.id,
        courseName: courseData.name,
        classGroupName: classGroupData.name,
        periodName: periodData.name,
        programName,
    };

    const format = new URL(request.url).searchParams.get("format");
    const dateSuffix = new Date().toISOString().slice(0, 10);

    if (format === "pdf") {
        const buffer = await buildCourseTeachersPdf(meta);
        return createPdfResponse(buffer, `professores-disciplina-${courseCode}-${dateSuffix}.pdf`);
    }

    const csv = await buildCourseTeachersCsv(courseData.id);
    return createCsvResponse(csv, `professores-disciplina-${courseCode}-${dateSuffix}.csv`);
}
