import { IconArrowLeft, IconDownload, IconFileTypePdf } from "@tabler/icons-react";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { TeachersPdfPreview } from "@/components/export/teachers-pdf-preview";
import { formatExportGeneratedAt } from "@/lib/export/format-generated-at";
import { requireAdmin } from "@/lib/auth-guards";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getProgramBySlug } from "@/services/programs/programs.service";
import { TEACHERS_EXPORT_COLUMNS } from "@/services/export/teachers-export.config";
import { getTeachersByPeriodForExport } from "@/services/export/teachers-csv.export";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";

export const metadata: Metadata = {
    title: "Pré-visualização PDF - Professores do Período",
};

async function PeriodTeachersExportPreviewPageContent({
    params,
}: PageProps<"/admin/[program]/periodos/[period]/professores/export-preview">) {
    if (process.env.NODE_ENV !== "development") {
        notFound();
    }

    const authResult = await requireAdmin();
    if (!authResult.ok) return null;

    const { program, period } = await params;

    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) {
        notFound();
    }

    const [programData, rows] = await Promise.all([
        getProgramBySlug(program),
        getTeachersByPeriodForExport(periodData.id),
    ]);

    const generatedAt = formatExportGeneratedAt();
    const exportPdfUrl = `/api/admin/${program}/periodos/${period}/professores/export?format=pdf`;
    const backUrl = `/admin/${program}/periodos/${period}/professores`;
    const programName = programData?.name ?? program;

    const serializedRows = rows.map((row) => ({
        ...row,
        birthDate: row.birthDate instanceof Date
            ? row.birthDate.toISOString()
            : row.birthDate,
    }));

    return (
        <Page className="flex flex-col min-h-screen">
            <Section>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <TitlePage
                            title="Pré-visualização do PDF"
                            description={`Professores do período ${periodData.name}`}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <ButtonLink variant="outline" href={backUrl}>
                            <IconArrowLeft className="size-4 mr-1" />
                            Voltar
                        </ButtonLink>
                        <ButtonLink href={exportPdfUrl}>
                            <IconDownload className="size-4 mr-1" />
                            Baixar PDF
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="flex-1 mt-4 min-h-0">
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <IconFileTypePdf className="size-4" />
                    <span>Edite os componentes em <code className="text-xs">src/lib/export/pdf/</code> e o preview atualiza automaticamente.</span>
                </div>
                <div className="rounded-2xl border border-surface-border overflow-hidden bg-muted/30" style={{ height: "calc(100vh - 220px)" }}>
                    <TeachersPdfPreview
                        title={`Professores de ${periodData.name}`}
                        subtitle={programName}
                        generatedAt={generatedAt}
                        rows={serializedRows}
                        columns={TEACHERS_EXPORT_COLUMNS}
                    />
                </div>
            </Section>
        </Page>
    );
}

export default function PeriodTeachersExportPreviewPage({
    params,
    searchParams,
}: PageProps<"/admin/[program]/periodos/[period]/professores/export-preview">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <PeriodTeachersExportPreviewPageContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
