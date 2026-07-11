import { requireAdmin } from "@/lib/auth-guards";
import { createCsvResponse } from "@/lib/export/csv";
import { formatExportDateSuffix } from "@/lib/export/format-generated-at";
import { createPdfResponse } from "@/lib/export/pdf";
import { buildAllTeachersCsv } from "@/services/export/teachers-csv.export";
import { buildAllTeachersPdf } from "@/services/export/teachers-pdf.export";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const authResult = await requireAdmin();
    if (!authResult.ok) {
        return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const format = new URL(request.url).searchParams.get("format");
    const dateSuffix = formatExportDateSuffix();

    if (format === "pdf") {
        const buffer = await buildAllTeachersPdf();
        return createPdfResponse(buffer, `professores-${dateSuffix}.pdf`);
    }

    const csv = await buildAllTeachersCsv();
    return createCsvResponse(csv, `professores-${dateSuffix}.csv`);
}
