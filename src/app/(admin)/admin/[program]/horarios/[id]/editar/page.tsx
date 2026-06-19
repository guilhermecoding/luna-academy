import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { EditTimeSlotForm } from "../../_components/edit-time-slot-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getTimeSlotById } from "@/services/schedules/schedules.service";
import { notFound } from "next/navigation";
import { WritePageGuard } from "@/components/write-page-guard";

export const metadata: Metadata = {
    title: "Editar Horário",
};

async function EditTimeSlotContent({
    params,
}: Omit<PageProps<"/admin/[program]/horarios/[id]/editar">, "searchParams">) {
    const { program, id } = await params;
    const timeSlot = await getTimeSlotById(id);

    if (!timeSlot) {
        notFound();
    }

    return (
        <WritePageGuard redirectTo={`/admin/${program}/horarios`}>
            <Page>
                <Section>
                    <BaseForm
                        title="Editar Horário"
                        description={`Atualize as informações do horário ${timeSlot.name}.`}
                    >
                        <div className="mt-6">
                            <Suspense fallback={<SkeletonForm />}>
                                <EditTimeSlotForm
                                    programSlug={program}
                                    timeSlotId={id}
                                    initialData={timeSlot}
                                />
                            </Suspense>
                        </div>
                    </BaseForm>
                </Section>
            </Page>
        </WritePageGuard>
    );
}

export default function EditTimeSlotPage({
    params,
}: PageProps<"/admin/[program]/horarios/[id]/editar">) {
    return (
        <Suspense fallback={<SkeletonForm />}>
            <EditTimeSlotContent params={params} />
        </Suspense>
    );
}
