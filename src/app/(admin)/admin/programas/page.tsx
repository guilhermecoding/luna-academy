import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import ListPrograms from "./_components/list-programs";
import { ButtonLink } from "@/components/ui/button-link";
import { Metadata } from "next";
import { requireAdmin, userCanWrite } from "@/lib/auth-guards";

export const metadata: Metadata = {
    title: "Programas",
};

export default async function ProgramsPage() {
    const authResult = await requireAdmin();
    if (!authResult.ok) return null;
    const canWrite = userCanWrite(authResult.session.user);

    return (
        <Page>
            <Section>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Programas"
                            description="Gerencie os programas de aprendizado disponíveis na sua instituição."
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        {canWrite && (
                            <ButtonLink className="w-full sm:w-auto" href="/admin/programas/novo">
                                <IconCirclePlusFilled className="size-5" />
                                Criar Programa
                            </ButtonLink>
                        )}
                    </div>
                </div>
            </Section>

            <Section className="mt-18">
                <ListPrograms />
            </Section>
        </Page>
    );
}
