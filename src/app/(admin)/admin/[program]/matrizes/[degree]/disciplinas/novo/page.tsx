import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreateSubjectForm } from "./_components/create-subject-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { WritePageGuard } from "@/components/write-page-guard";
import PageSkeleton from "@/components/skeletons/page-skeleton";

export const metadata: Metadata = {
    title: "Nova Disciplina Teórica",
};

async function NewSubjectPageContent({
    params,
}: Omit<PageProps<"/admin/[program]/matrizes/[degree]/disciplinas/novo">, "searchParams">) {
    const { program, degree } = await params;

    return (
        <WritePageGuard redirectTo={`/admin/${program}/matrizes/${degree}/disciplinas`}>
            <Page>
                <Section>
                    <BaseForm
                        title="Nova Disciplina/Matéria"
                        description="Adicione uma disciplina base teórica a grade curricular."
                    >
                        <div className="mt-6">
                            <Suspense fallback={<SkeletonForm />}>
                                <CreateSubjectForm programSlug={program} degreeSlug={degree} />
                            </Suspense>
                        </div>
                    </BaseForm>
                </Section>
            </Page>
        </WritePageGuard>
    );
}

export default function NewSubjectPage({
    params,
}: PageProps<"/admin/[program]/matrizes/[degree]/disciplinas/novo">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <NewSubjectPageContent params={params} />
        </Suspense>
    );
}