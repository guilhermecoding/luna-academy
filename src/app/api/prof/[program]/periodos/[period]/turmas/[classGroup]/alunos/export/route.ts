import { createCsvResponse } from "@/lib/export/csv";
import { formatExportDateSuffix } from "@/lib/export/format-generated-at";
import { createPdfResponse } from "@/lib/export/pdf";
import { requireTeacherClassGroupExportAccess } from "@/lib/teacher-period-guards";
import { getProgramBySlug } from "@/services/programs/programs.service";
import { buildClassGroupStudentsCsv } from "@/services/export/students-csv.export";
import { buildClassGroupStudentsPdf } from "@/services/export/students-pdf.export";
import { NextResponse } from "next/server";

function guardErrorStatus(error: string): number {
    if (error === "Período não encontrado." || error === "Turma não encontrada.") {
        return 404;
    }

    if (error === "Não autorizado." || error === "Este período foi finalizado.") {
        return 403;
    }

    return 401;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ program: string; period: string; classGroup: string }> },
) {
    const { program, period, classGroup } = await params;
    const authResult = await requireTeacherClassGroupExportAccess(program, period, classGroup);

    if (!authResult.ok) {
        return NextResponse.json(
            { error: authResult.error },
            { status: guardErrorStatus(authResult.error) },
        );
    }

    const { period: periodData, classGroup: classGroupData } = authResult.resolved;
    const format = new URL(request.url).searchParams.get("format");
    const dateSuffix = formatExportDateSuffix();

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
