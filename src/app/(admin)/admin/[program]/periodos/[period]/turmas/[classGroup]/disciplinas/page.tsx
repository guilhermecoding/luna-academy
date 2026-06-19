import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconBooks, IconCirclePlusFilled } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Metadata } from "next";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getStudentCountByClassGroupId } from "@/services/students/students.service";
import { notFound } from "next/navigation";
import ListDisciplines from "../../_components/list-disciplines";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { requireAdmin, userCanWrite } from "@/lib/auth-guards";

export const metadata: Metadata = {
    title: "Disciplinas da Turma",
};

async function AdminClassGroupCoursesPageContent({
    params,
}: Omit<PageProps<"/admin/[program]/periodos/[period]/turmas/[classGroup]/disciplinas">, "searchParams">) {
    const authResult = await requireAdmin();
    if (!authResult.ok) return null;
    const canWrite = userCanWrite(authResult.session.user);

    const { program, period, classGroup: classGroupSlug } = await params;

    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) notFound();

    const classGroup = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroupSlug);
    if (!classGroup) notFound();

    const studentCount = await getStudentCountByClassGroupId(classGroup.id);

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconBooks className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Disciplinas Ofertadas</p>
                </div>

                <TitlePage
                    title={classGroup.name}
                    description={`${classGroup.degree.name} • ${classGroup.basePeriod}ª Série • ${classGroup.shift === "MORNING" ? "Manhã" : classGroup.shift === "AFTERNOON" ? "Tarde" : "Noite"}`}
                />
                <div className="flex justify-end mt-4">
                    {canWrite && (
                        <ButtonLink
                            href={`/admin/${program}/periodos/${period}/turmas/${classGroupSlug}/disciplinas/novo`}
                            className="w-full sm:w-auto"
                        >
                            <IconCirclePlusFilled className="size-5" />
                            Adicionar Disciplina
                        </ButtonLink>
                    )}
                </div>
            </Section>

            <Section className="mt-12">
                <ListDisciplines
                    courses={classGroup.courses}
                    programSlug={program}
                    periodSlug={period}
                    classGroupSlug={classGroupSlug}
                    studentCount={studentCount}
                />
            </Section>
        </Page>
    );
}

export default function AdminClassGroupCoursesPage({
    params,
}: PageProps<"/admin/[program]/periodos/[period]/turmas/[classGroup]/disciplinas">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <AdminClassGroupCoursesPageContent params={params} />
        </Suspense>
    );
}