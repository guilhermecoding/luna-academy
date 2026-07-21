import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreateRoomForm } from "./_components/create-room-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getCampusBySlug } from "@/services/campuses/campuses.service";
import { notFound } from "next/navigation";
import { WritePageGuard } from "@/components/write-page-guard";
import PageSkeleton from "@/components/skeletons/page-skeleton";

export const metadata: Metadata = {
    title: "Nova Sala",
};

async function NewRoomPageContent({
    params,
}: Omit<PageProps<"/admin/instituicoes/[campus]/salas/novo">, "searchParams">) {
    const { campus } = await params;
    const campusData = await getCampusBySlug(campus);

    if (!campusData) {
        notFound();
    }

    return (
        <WritePageGuard redirectTo={`/admin/instituicoes/${campus}/salas`}>
            <Page>
                <Section>
                    <BaseForm
                        title="Nova Sala"
                        description={`Cadastre uma nova sala ou laboratório em ${campusData.name}.`}
                    >
                        <div className="mt-6">
                            <Suspense fallback={<SkeletonForm />}>
                                <CreateRoomForm campusSlug={campus} />
                            </Suspense>
                        </div>
                    </BaseForm>
                </Section>
            </Page>
        </WritePageGuard>
    );
}

export default function NewRoomPage({
    params,
}: PageProps<"/admin/instituicoes/[campus]/salas/novo">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <NewRoomPageContent params={params} />
        </Suspense>
    );
}