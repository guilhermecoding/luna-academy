import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getStudentCountByClassGroupId, getStudentsByClassGroupList } from "@/services/students/students.service";
import { IconBooks, IconClockHour2, IconSchool, IconUsers } from "@tabler/icons-react";
import { notFound, redirect } from "next/navigation";
import InfoBoxPeriod from "@/app/(admin)/admin/[program]/periodos/[period]/_components/info-box-period";
import ListDisciplines from "@/app/(admin)/admin/[program]/periodos/[period]/turmas/_components/list-disciplines";
import { Metadata } from "next";
import { Shift } from "@/generated/prisma/enums";
import { DataTableClassStudents } from "@/app/(admin)/admin/[program]/periodos/[period]/turmas/[classGroup]/_components/data-table-class-students";
import { classGroupStudentsColumns } from "@/app/(admin)/admin/[program]/periodos/[period]/alunos/_components/columns-period";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";

export const metadata: Metadata = {
    title: "Detalhes da Turma",
};

async function ProfClassPageContent({
    params,
    searchParams,
}: {
    params: Promise<{ program: string; period: string; classGroup: string }>;
    searchParams: Promise<{ q?: string }>;
}) {
    const { program, period, classGroup: classGroupSlug } = await params;
    const { q } = await searchParams;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/entrar");
    }

    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) {
        notFound();
    }

    const classGroupData = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroupSlug);
    if (!classGroupData) {
        notFound();
    }

    const teacherCourses = classGroupData.courses.filter(course =>
        course.schedules.some(schedule => schedule.teacherId === session.user.id),
    );

    const [studentCount, disciplinesCount, studentsList] = await Promise.all([
        getStudentCountByClassGroupId(classGroupData.id),
        Promise.resolve(teacherCourses.length),
        getStudentsByClassGroupList(classGroupData.id, q),
    ]);

    const shiftMap: Record<Shift, string> = {
        MORNING: "MATUTINO",
        AFTERNOON: "VESPERTINO",
        EVENING: "NOTURNO",
    };



    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconSchool className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Detalhes da Turma</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={classGroupData.name}
                            description={`Informações da turma ${classGroupData.name}.`}
                        />
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoBoxPeriod
                    label="ALUNOS NA TURMA"
                    value={studentCount}
                    color="emerald"
                    icon={<IconUsers className="size-full" />}
                />
                <InfoBoxPeriod
                    label="SUAS DISCIPLINAS"
                    value={disciplinesCount}
                    color="indigo"
                    icon={<IconBooks className="size-full" />}
                />
                <InfoBoxPeriod
                    label="TURNO"
                    value={shiftMap[classGroupData.shift] || classGroupData.shift}
                    color="amber"
                    icon={<IconClockHour2 className="size-full" />}
                />
            </Section>

            <Section className="mt-12">
                <div className="flex flex-row items-center gap-2 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <IconBooks className="size-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Suas Disciplinas</h2>
                </div>

                <ListDisciplines
                    courses={teacherCourses}
                    programSlug={program}
                    periodSlug={period}
                    classGroupSlug={classGroupSlug}
                    studentCount={studentCount}
                    baseUrl="/prof"
                    showEditOption={false}
                />
            </Section>

            <Section className="mt-12">
                <div className="flex flex-row items-center gap-2 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <IconUsers className="size-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Alunos Matriculados</h2>
                </div>

                <DataTableClassStudents
                    columns={classGroupStudentsColumns}
                    data={studentsList}
                    periodId={periodData.id}
                    classGroupId={classGroupData.id}
                    hideActionsAndSelect={true}
                />
            </Section>
        </Page>
    );
}


export default function ProfClassPage({
    params,
    searchParams,
}: {
    params: Promise<{ program: string; period: string; classGroup: string }>;
    searchParams: Promise<{ q?: string }>;
}) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <ProfClassPageContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
