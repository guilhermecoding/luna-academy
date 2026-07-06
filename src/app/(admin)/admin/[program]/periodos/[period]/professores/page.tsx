import { IconSchool } from "@tabler/icons-react";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ExportStudentsDropdown } from "@/components/export/export-students-dropdown";
import { getTeachersByPeriod } from "@/services/users/teachers.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { PeriodTeachersTable } from "./_components/period-teachers-table";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { requireAdmin } from "@/lib/auth-guards";

export const metadata: Metadata = {
    title: "Professores do Período",
};

async function AdminPeriodTeachersPageContent({
    params,
    searchParams,
}: PageProps<"/admin/[program]/periodos/[period]/professores">) {
    const authResult = await requireAdmin();
    if (!authResult.ok) return null;

    const { program, period } = await params;
    const { q } = await searchParams;
    const searchQuery = typeof q === "string" ? q : undefined;

    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) {
        notFound();
    }

    const teachersList = await getTeachersByPeriod(periodData.id, searchQuery);

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconSchool className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Professores do Período</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={`Professores - ${periodData.name}`}
                            description="Professores vinculados às disciplinas deste período letivo."
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-1 gap-2 justify-end items-end">
                        <ExportStudentsDropdown
                            exportPath={`/api/admin/${program}/periodos/${period}/professores/export`}
                            ariaLabel="Exportar professores do período"
                        />
                    </div>
                </div>
            </Section>

            <Section className="mt-8">
                <div className="bg-surface border border-surface-border p-6 rounded-3xl">
                    <PeriodTeachersTable
                        data={teachersList}
                        periodId={periodData.id}
                        title={
                            <h2 className="text-xl flex flex-row items-center gap-2 font-bold text-foreground">
                                <IconSchool className="size-6" />
                                Professores vinculados
                            </h2>
                        }
                    />
                </div>
            </Section>
        </Page>
    );
}

export default function AdminPeriodTeachersPage({
    params,
    searchParams,
}: PageProps<"/admin/[program]/periodos/[period]/professores">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <AdminPeriodTeachersPageContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
