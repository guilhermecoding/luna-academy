import { IconArrowLeft, IconDownload, IconFileTypePdf } from "@tabler/icons-react";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { StudentsPdfPreview } from "@/components/export/students-pdf-preview";
import { requireAdmin } from "@/lib/auth-guards";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { loadCourseStudentsExportData } from "@/services/export/course-students.export";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
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
}: PageProps<"/admin/[program]/periodos/[period]/turmas/[classGroup]/disciplinas/[course]/export-preview">) {
    if (process.env.NODE_ENV !== "development") {
        notFound();
    }

    const authResult = await requireAdmin();
    if (!authResult.ok) return null;

    const { program, period, classGroup: classGroupSlug, course: courseCode } = await params;

    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) {
        notFound();
    }

    const classGroupData = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroupSlug);
    if (!classGroupData) {
        notFound();
    }

    const courseData = await getCourseByPeriodIdAndCode(periodData.id, courseCode);
    if (!courseData || courseData.classGroupId !== classGroupData.id) {
        notFound();
    }

    const programData = await getProgramBySlug(program);
    const programName = programData?.name ?? program;

    const { rows, meta } = await loadCourseStudentsExportData(
        courseData,
        classGroupData.name,
        programName,
    );

    const generatedAt = new Date().toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
    const exportPdfUrl = `/api/admin/${program}/periodos/${period}/turmas/${classGroupSlug}/disciplinas/${courseCode}/alunos/export?format=pdf`;
    const backUrl = `/admin/${program}/periodos/${period}/turmas/${classGroupSlug}/disciplinas/${courseCode}`;

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
}: PageProps<"/admin/[program]/periodos/[period]/turmas/[classGroup]/disciplinas/[course]/export-preview">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <CourseExportPreviewPageContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
