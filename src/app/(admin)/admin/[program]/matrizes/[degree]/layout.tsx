import { getDegreeBySlug } from "@/services/degrees/degrees.service";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";

async function DegreeLayoutContent({
    children,
    params,
}: LayoutProps<"/admin/[program]/matrizes/[degree]">) {
    const { program: programSlug, degree: degreeSlug } = await params;

    const degree = await getDegreeBySlug(programSlug, degreeSlug);

    if (!degree) {
        return notFound();
    }

    return (
        <>
            {children}
        </>
    );
}

export default function DegreeLayout({
    children,
    params,
}: LayoutProps<"/admin/[program]/matrizes/[degree]">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <DegreeLayoutContent params={params}>
                {children}
            </DegreeLayoutContent>
        </Suspense>
    );
}
