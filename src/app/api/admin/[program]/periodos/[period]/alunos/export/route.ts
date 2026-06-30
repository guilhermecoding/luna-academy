import { requireAdmin } from "@/lib/auth-guards";
import { createCsvResponse } from "@/lib/export/csv";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { buildPeriodStudentsCsv } from "@/services/export/students-csv.export";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
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

    const csv = await buildPeriodStudentsCsv(periodData.id);
    const filename = `alunos-${period}-${new Date().toISOString().slice(0, 10)}.csv`;

    return createCsvResponse(csv, filename);
}
