import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { IconSchool } from "@tabler/icons-react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ListClassGroups from "@/app/(admin)/admin/[program]/periodos/[period]/turmas/_components/list-class-groups";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";

export const metadata: Metadata = {
    title: "Minhas Turmas",
};

async function TeacherClassGroupsPageContent({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {
    const { program, period } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/entrar");
    }

    const teacherId = session.user.id;

    const periodData = await getPeriodByProgramAndSlug(program, period);

    if (!periodData) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconSchool className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Turmas</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={`Minhas Turmas do ${periodData.name}`}
                            description="Selecione uma turma para acessar o conteúdo."
                        />
                    </div>
                </div>
            </Section>

            <Section className="mt-18">
                <ListClassGroups
                    periodId={periodData.id}
                    programSlug={program}
                    periodSlug={period}
                    teacherId={teacherId}
                    baseUrl="/prof"
                    showCreateOption={false}
                />
            </Section>
        </Page>
    );
}

export default function TeacherClassGroupsPage({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {

    return (
        <Suspense fallback={<PageSkeleton />}>
            <TeacherClassGroupsPageContent params={params} />
        </Suspense>
    );
}
