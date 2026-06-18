import PageSkeleton from "@/components/skeletons/page-skeleton";
import { enforceTeacherPeriodAccess } from "@/lib/teacher-period-guards";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function TeacherPeriodLayoutContent({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string; period: string }>;
}>) {
    const { program: programSlug, period: periodSlug } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/entrar");
    }

    await enforceTeacherPeriodAccess(programSlug, periodSlug, session.user.id);

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
