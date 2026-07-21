import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreateDegreeForm } from "./_components/create-degree-form";
import { Metadata } from "next";
import { WritePageGuard } from "@/components/write-page-guard";
import PageSkeleton from "@/components/skeletons/page-skeleton";

export const metadata: Metadata = {
    title: "Nova Matriz Curricular",
};

async function NewDegreePageContent({
    params,
}: Omit<PageProps<"/admin/[program]/matrizes/novo">, "searchParams">) {
    const { program } = await params;

    return (
        <WritePageGuard redirectTo={`/admin/${program}/matrizes`}>
            <Page>
                <Section>
                    <BaseForm
                        title="Nova Matriz Curricular"
                        description="Adicione uma estrutura de curso/matriz para agrupar disciplinas"
                    >
                        <div className="mt-6">
                            <Suspense fallback={null}>
                                <CreateDegreeForm programSlug={program} />
                            </Suspense>
                        </div>
                    </BaseForm>
                </Section>
            </Page>
        </WritePageGuard>
    );
}

export default function NewDegreePage({
    params,
}: PageProps<"/admin/[program]/matrizes/novo">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <NewDegreePageContent params={params} />
        </Suspense>
    );
}
