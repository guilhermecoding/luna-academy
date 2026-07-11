import { requireAdmin } from "@/lib/auth-guards";
import { createCsvResponse } from "@/lib/export/csv";
import { formatExportDateSuffix } from "@/lib/export/format-generated-at";
import { createPdfResponse } from "@/lib/export/pdf";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getProgramBySlug } from "@/services/programs/programs.service";
import { buildPeriodTeachersCsv } from "@/services/export/teachers-csv.export";
import { buildPeriodTeachersPdf } from "@/services/export/teachers-pdf.export";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ program: string; period: string }> },
) {
    const authResult = await requireAdmin();
    if (!authResult.ok) {
        return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { program, period } = await params;
    const periodData = await getPeriodByProgramAndSlug(program, period);

    if (!periodData) {
        return NextResponse.json({ error: "Período não encontrado" }, { status: 404 });
    }

    const format = new URL(request.url).searchParams.get("format");
    const dateSuffix = formatExportDateSuffix();

    if (format === "pdf") {
        const programData = await getProgramBySlug(program);
        const buffer = await buildPeriodTeachersPdf({
            periodId: periodData.id,
            periodName: periodData.name,
            programName: programData?.name ?? program,
        });

        return createPdfResponse(buffer, `professores-${period}-${dateSuffix}.pdf`);
    }

    const csv = await buildPeriodTeachersCsv(periodData.id);
    return createCsvResponse(csv, `professores-${period}-${dateSuffix}.csv`);
}
