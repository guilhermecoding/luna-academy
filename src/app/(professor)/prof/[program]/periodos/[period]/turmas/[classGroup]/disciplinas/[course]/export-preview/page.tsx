import { IconArrowLeft, IconDownload, IconFileTypePdf } from "@tabler/icons-react";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { StudentsPdfPreview } from "@/components/export/students-pdf-preview";
import { formatExportGeneratedAt } from "@/lib/export/format-generated-at";
import { requireTeacherCourseExportAccess } from "@/lib/teacher-period-guards";
import { loadCourseStudentsExportData } from "@/services/export/course-students.export";
import { getProgramBySlug } from "@/services/programs/programs.service";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";

export const metadata: Metadata = {
    title: "Pré-visualização PDF - Alunos da Disciplina",
};

async function CourseExportPreviewPageContent({
    params,
}: PageProps<"/prof/[program]/periodos/[period]/turmas/[classGroup]/disciplinas/[course]/export-preview">) {
    if (process.env.NODE_ENV !== "development") {
        notFound();
    }

    const { program, period, classGroup: classGroupSlug, course: courseCode } = await params;
    const authResult = await requireTeacherCourseExportAccess(
        program,
        period,
        classGroupSlug,
        courseCode,
    );

    if (!authResult.ok) {
        return null;
    }

    const { period: periodData, classGroup: classGroupData, course: courseData } = authResult.resolved;
    const programData = await getProgramBySlug(program);
    const programName = programData?.name ?? program;

    const { rows, meta } = await loadCourseStudentsExportData(
        courseData,
        classGroupData.name,
        programName,
    );

    const generatedAt = formatExportGeneratedAt();
    const exportPdfUrl = `/api/prof/${program}/periodos/${period}/turmas/${classGroupSlug}/disciplinas/${courseCode}/alunos/export?format=pdf`;
    const backUrl = `/prof/${program}/periodos/${period}/turmas/${classGroupSlug}/disciplinas/${courseCode}`;

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
                            description={`Alunos da disciplina ${courseData.name}`}
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
                    <StudentsPdfPreview
                        title={`Alunos de ${courseData.name}`}
                        subtitle={`${programName} · ${classGroupData.name} · ${periodData.name}`}
                        generatedAt={generatedAt}
                        rows={serializedRows}
                        teachers={meta.teachers}
                    />
                </div>
            </Section>
        </Page>
    );
}

export default function CourseExportPreviewPage({
    params,
    searchParams,
}: PageProps<"/prof/[program]/periodos/[period]/turmas/[classGroup]/disciplinas/[course]/export-preview">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <CourseExportPreviewPageContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
