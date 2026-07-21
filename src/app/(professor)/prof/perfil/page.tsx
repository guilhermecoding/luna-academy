import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { Metadata } from "next";
import { getUserById } from "@/services/users/users.service";
import { isGoogleAccountLinked, hasCredentialAccount } from "@/services/users/accounts.service";
import { notFound } from "next/navigation";
import EditProfileForm from "./_components/edit-profile-form";
import { auth, isGoogleAuthConfigured } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { getProgramsForTeacher } from "@/services/programs/programs.service";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { Suspense } from "react";

const ACTIVE_PROGRAM_COOKIE_NAME = "active_program_slug";

async function getProfessorCancelHref(userId: string): Promise<string> {
    const programs = await getProgramsForTeacher(userId);
    if (programs.length === 0) {
        return "/prof";
    }

    const cookieStore = await cookies();
    const activeSlug = cookieStore.get(ACTIVE_PROGRAM_COOKIE_NAME)?.value;
    const targetSlug = programs.find((program) => program.slug === activeSlug)?.slug ?? programs[0].slug;

    return `/prof/${targetSlug}/periodos`;
}

export const metadata: Metadata = {
    title: "Meu Perfil",
};

async function ProfessorProfilePageContent() {
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
    const cancelHref = await getProfessorCancelHref(session.user.id);

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
                    cancelHref={cancelHref}
                />
            </Section>
        </Page>
    );
}

export default function ProfessorProfilePage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <ProfessorProfilePageContent />
        </Suspense>
    );
}