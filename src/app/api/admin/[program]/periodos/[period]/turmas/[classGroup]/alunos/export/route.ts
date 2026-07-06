import { requireAdmin } from "@/lib/auth-guards";
import { createCsvResponse } from "@/lib/export/csv";
import { createPdfResponse } from "@/lib/export/pdf";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getProgramBySlug } from "@/services/programs/programs.service";
import {
    buildClassGroupStudentsCsv,
} from "@/services/export/students-csv.export";
import { buildClassGroupStudentsPdf } from "@/services/export/students-pdf.export";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ program: string; period: string; classGroup: string }> },
) {
    const authResult = await requireAdmin();
    if (!authResult.ok) {
        return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { program, period, classGroup } = await params;
    const periodData = await getPeriodByProgramAndSlug(program, period);

    if (!periodData) {
        return NextResponse.json({ error: "Período não encontrado" }, { status: 404 });
    }

    const classGroupData = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroup);

    if (!classGroupData) {
        return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 });
    }

    const format = new URL(request.url).searchParams.get("format");
    const dateSuffix = new Date().toISOString().slice(0, 10);

    if (format === "pdf") {
        const programData = await getProgramBySlug(program);
        const buffer = await buildClassGroupStudentsPdf({
            classGroupId: classGroupData.id,
            classGroupName: classGroupData.name,
            periodName: periodData.name,
            programName: programData?.name ?? program,
        });

        return createPdfResponse(buffer, `alunos-turma-${classGroup}-${dateSuffix}.pdf`);
    }

    const csv = await buildClassGroupStudentsCsv(classGroupData.id);
    return createCsvResponse(csv, `alunos-turma-${classGroup}-${dateSuffix}.csv`);
}
