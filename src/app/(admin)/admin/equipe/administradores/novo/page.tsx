import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { Metadata } from "next";
import { getTeachers } from "@/services/users/teachers.service";
import CreateAdminForm from "./_components/create-admin-form";
import { WritePageGuard } from "@/components/write-page-guard";
import { Suspense } from "react";
import SkeletonForm from "@/components/skeletons/skeleton-form";

export const metadata: Metadata = {
    title: "Novo Administrador",
};

async function NewAdminPageContent() {
    const teachers = await getTeachers();

    return (
        <WritePageGuard redirectTo="/admin/equipe/administradores">
            <Page>
                <Section>
                    <TitlePage
                        title="Novo Administrador"
                        description="Adicione um novo administrador ao sistema. Você pode criar um do zero ou selecionar um professor existente."
                    />
                </Section>

                <Section className="mt-8">
                    <CreateAdminForm teachers={teachers} />
                </Section>
            </Page>
        </WritePageGuard>
    );
}

export default function NewAdminPage() {
    return (
        <Suspense fallback={
            <Page>
                <Section>
                    <SkeletonForm />
                </Section>
            </Page>
        }>
            <NewAdminPageContent />
        </Suspense>
    );
}