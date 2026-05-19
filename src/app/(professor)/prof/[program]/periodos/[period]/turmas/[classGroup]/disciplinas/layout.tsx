import PageSkeleton from "@/components/skeletons/page-skeleton";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function ClassGroupDisciplinesLayoutContent({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string; period: string; classGroup: string }>;
}>) {
    const { program: programSlug, period: periodSlug, classGroup: classGroupSlug } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/entrar");
    }

    const periodData = await getPeriodByProgramAndSlug(programSlug, periodSlug);

    if (!periodData) {
        return notFound();
    }

    const classGroup = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroupSlug);

    if (!classGroup) {
        return notFound();
    }

    // Validar se o professor tem acesso a esta turma (tem que ter aulas agendadas nela)
    const hasAccess = classGroup.courses.some(course =>
        course.schedules.some(schedule => schedule.teacherId === session?.user?.id),
    );

    if (!hasAccess) {
        redirect(`/prof/${programSlug}/periodos/${periodSlug}/turmas`);
    }

    return <>{children}</>;
}

export default function ClassGroupDisciplinesTeacherLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string; period: string; classGroup: string }>;
}>) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <ClassGroupDisciplinesLayoutContent params={params}>
                {children}
            </ClassGroupDisciplinesLayoutContent>
        </Suspense>
    );
}
