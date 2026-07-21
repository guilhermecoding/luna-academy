import PageSkeleton from "@/components/skeletons/page-skeleton";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function CampusDetailsPageContent({
    params,
}: Omit<PageProps<"/admin/instituicoes/[campus]">, "searchParams">) {
    const { campus } = await params;
    redirect(`/admin/instituicoes/${campus}/salas`);
    return null;
}

export default function CampusDetailsPage({
    params,
}: PageProps<"/admin/instituicoes/[campus]">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <CampusDetailsPageContent params={params} />
        </Suspense>
    );
}