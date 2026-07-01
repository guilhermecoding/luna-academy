import { ExportStudentsDropdown } from "@/components/export/export-students-dropdown";
import Page from "@/components/page";
import Section from "@/components/section";
import { IconSchool, IconPlus, IconUserCheck, IconUserX } from "@tabler/icons-react";
import { Metadata } from "next";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { TeachersTable } from "./_components/teachers-table";
import { getTeachers, getTeacherStats } from "@/services/users/teachers.service";
import InfoBoxUsers from "../_components/info-box-users";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { requireAdmin, userCanWrite } from "@/lib/auth-guards";

export const metadata: Metadata = {
    title: "Professores",
};

async function AdminTeachersPageContent({
    searchParams,
}: PageProps<"/admin/equipe/professores">) {
    const authResult = await requireAdmin();
    if (!authResult.ok) return null;
    const canWrite = userCanWrite(authResult.session.user);

    const { q } = await searchParams;
    const searchQuery = typeof q === "string" ? q : undefined;

    const [teachersList, teacherStats] = await Promise.all([
        getTeachers(searchQuery),
        getTeacherStats(),
    ]);

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconSchool className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Professores</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Professores"
                            description="Gerencie os professores da sua instituição."
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-1 gap-2 justify-end items-end">
                        <ExportStudentsDropdown
                            exportPath="/api/admin/equipe/professores/export"
                            ariaLabel="Exportar professores"
                        />
                        {canWrite && (
                            <ButtonLink className="w-full sm:w-auto" href="/admin/equipe/professores/novo">
                                <IconPlus className="size-4" />
                                Adicionar Professor
                            </ButtonLink>
                        )}
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <InfoBoxUsers
                    label="TOTAL"
                    value={teacherStats.totalTeachers}
                    color="indigo"
                    icon={<IconSchool className="size-full" />}
                />
                <InfoBoxUsers
                    label="ATIVOS"
                    value={teacherStats.activeTeachers}
                    color="emerald"
                    icon={<IconUserCheck className="size-full" />}
                />
                <InfoBoxUsers
                    label="INATIVOS"
                    value={teacherStats.inactiveTeachers}
                    color="amber"
                    icon={<IconUserX className="size-full" />}
                />
            </Section>

            <Section className="mt-8">
                <div className="bg-surface border border-surface-border p-6 rounded-3xl">
                    <TeachersTable
                        data={teachersList}
                        title={
                            <h2 className="text-xl font-bold text-foreground">
                                Todos os professores
                            </h2>
                        }
                    />
                </div>
            </Section>
        </Page>
    );
}

export default function AdminTeachersPage({
    params,
    searchParams,
}: PageProps<"/admin/equipe/professores">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <AdminTeachersPageContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
