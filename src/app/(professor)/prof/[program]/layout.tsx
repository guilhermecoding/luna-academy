import { getProgramBySlug, getProgramsForTeacher } from "@/services/programs/programs.service";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function ProgramLayoutContent({
    children,
    params,
}: Readonly<{
    children: React.ReactNode
    params: Promise<{ program: string }>
}>) {
    const { program: programSlug } = await params;

    const program = await getProgramBySlug(programSlug);

    if (!program) {
        return notFound();
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/entrar");
    }

    // Validar se o professor tem acesso a este programa
    const programs = await getProgramsForTeacher(session.user.id);
    const hasAccess = programs.some((p) => p.slug === programSlug);

    if (!hasAccess) {
        redirect("/prof");
    }

    return (
        <>
            {children}
        </>
    );
}

export default function ProgramLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string }>
}>) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <ProgramLayoutContent params={params}>
                {children}
            </ProgramLayoutContent>
        </Suspense>
    );
}
