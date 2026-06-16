import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreateTimeSlotForm } from "./_components/create-time-slot-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { WritePageGuard } from "@/components/write-page-guard";

export const metadata: Metadata = {
    title: "Novo Horário",
};

export default async function NewTimeSlotPage({
    params,
}: Omit<PageProps<"/admin/[program]/horarios/novo">, "searchParams">) {
    const { program } = await params;

    return (
        <WritePageGuard redirectTo={`/admin/${program}/horarios`}>
        <Page>
            <Section>
                <BaseForm
                    title="Novo Horário"
                    description="Cadastre um novo slot de tempo para a grade de horários."
                >
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <CreateTimeSlotForm programSlug={program} />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
        </WritePageGuard>
    );
}
