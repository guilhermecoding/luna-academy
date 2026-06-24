import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { Metadata } from "next";
import { getUserById } from "@/services/users/users.service";
import { isGoogleAccountLinked, hasCredentialAccount } from "@/services/users/accounts.service";
import { notFound } from "next/navigation";
import EditProfileForm from "./_components/edit-profile-form";
import { auth, isGoogleAuthConfigured } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
    title: "Meu Perfil",
};

export default async function ProfessorProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || !session.user.isTeacher) {
        notFound();
    }

    const member = await getUserById(session.user.id);

    if (!member) {
        notFound();
    }

    const googleLinked = await isGoogleAccountLinked(session.user.id);
    const canUnlinkGoogle = await hasCredentialAccount(session.user.id);
    const googleAuthEnabled = isGoogleAuthConfigured();

    return (
        <Page>
            <Section>
                <TitlePage
                    title="Meu Perfil"
                    description="Visualize e atualize suas informações pessoais e credenciais de acesso."
                />
            </Section>

            <Section className="mt-8">
                <EditProfileForm
                    member={member}
                    googleLinked={googleLinked}
                    canUnlinkGoogle={canUnlinkGoogle}
                    googleAuthEnabled={googleAuthEnabled}
                />
            </Section>
        </Page>
    );
}
