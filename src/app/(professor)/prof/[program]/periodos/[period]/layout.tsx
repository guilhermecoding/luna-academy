import PageSkeleton from "@/components/skeletons/page-skeleton";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getPeriodsForTeacherByProgramSlug } from "@/services/programs/programs.service";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function TeacherPeriodLayoutContent({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string; period: string }>;
}>) {
    const { program: programSlug, period: periodSlug } = await params;

    const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);

    if (!period || period.completedAt) {
        return notFound();
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/entrar");
    }

    // Validar se o professor tem acesso a este período específico
    const teacherPeriods = await getPeriodsForTeacherByProgramSlug(programSlug, session.user.id);
    const hasAccess = teacherPeriods?.some((p) => p.slug === periodSlug);

    if (!hasAccess) {
        redirect(`/prof/${programSlug}/periodos`);
    }

    return <>{children}</>;
}

export default function TeacherPeriodLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string; period: string }>;
}>) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <TeacherPeriodLayoutContent params={params}>
                {children}
            </TeacherPeriodLayoutContent>
        </Suspense>
    );
}