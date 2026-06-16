import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { Metadata } from "next";
import { getAdmins } from "@/services/users/admins.service";
import CreateTeacherForm from "./_components/create-teacher-form";
import { WritePageGuard } from "@/components/write-page-guard";

export const metadata: Metadata = {
    title: "Novo Professor",
};

export default async function NewTeacherPage() {
    const admins = await getAdmins();

    return (
        <WritePageGuard redirectTo="/admin/equipe/professores">
            <Page>
                <Section>
                    <TitlePage
                        title="Novo Professor"
                        description="Adicione um novo professor ao sistema. Você pode criar um do zero ou selecionar um administrador existente."
                    />
                </Section>

                <Section className="mt-8">
                    <CreateTeacherForm admins={admins} />
                </Section>
            </Page>
        </WritePageGuard>
    );
}
