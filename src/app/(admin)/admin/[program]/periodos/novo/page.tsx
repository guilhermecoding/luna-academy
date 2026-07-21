import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreatePeriodForm } from "./_components/create-period-form";
import { Metadata } from "next";
import { WritePageGuard } from "@/components/write-page-guard";
import PageSkeleton from "@/components/skeletons/page-skeleton";

export const metadata: Metadata = {
    title: "Novo Período",
};

async function NewPeriodPageContent({
    params,
}: Omit<PageProps<"/admin/[program]/periodos/novo">, "searchParams">) {
    const { program } = await params;

    return (
        <WritePageGuard redirectTo={`/admin/${program}/periodos`}>
            <Page>
                <Section>
                    <BaseForm
                        title="Novo Período"
                        description="Adicione um novo período letivo ao sistema"
                    >
                        <div className="mt-6">
                            <Suspense fallback={null}>
                                <CreatePeriodForm programSlug={program} />
                            </Suspense>
                        </div>
                    </BaseForm>
                </Section>
            </Page>
        </WritePageGuard>
    );
}

export default function NewPeriodPage({
    params,
}: PageProps<"/admin/[program]/periodos/novo">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <NewPeriodPageContent params={params} />
        </Suspense>
    );
}