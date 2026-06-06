import PageSkeleton from "@/components/skeletons/page-skeleton";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function PeriodLayoutContent({
    children,
    params,
}: LayoutProps<"/admin/[program]/periodos/[period]">) {
    const { program: programSlug, period: periodSlug } = await params;

    const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);

    if (!period) {
        return notFound();
    }

    return <>{children}</>;
}

export default function PeriodLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
} & LayoutProps<"/admin/[program]/periodos/[period]">>) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <PeriodLayoutContent params={params}>
                {children}
            </PeriodLayoutContent>
        </Suspense>
    );
}
