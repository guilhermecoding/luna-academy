import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { Metadata } from "next";
import { getUserById } from "@/services/users/users.service";
import { isGoogleAccountLinked, hasCredentialAccount } from "@/services/users/accounts.service";
import { notFound } from "next/navigation";
import EditMemberForm from "./_components/edit-member-form";
import { Suspense } from "react";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { requireAdmin, userCanWrite } from "@/lib/auth-guards";
import { isGoogleAuthConfigured } from "@/lib/auth";
import { redirectIfReadOnlyUser } from "@/lib/read-only-routes";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Editar Membro",
};

async function AdminEditMemberPageContent({
    params,
}: Omit<PageProps<"/admin/equipe/[memberId]/editar">, "searchParams">) {
    const { memberId } = await params;
    const authResult = await requireAdmin();
    if (!authResult.ok) redirect("/entrar");

    redirectIfReadOnlyUser(authResult.session.user, "/admin/equipe", {
        memberId,
        allowSelfEdit: true,
    });

    const member = await getUserById(memberId);

    if (!member || (!member.isAdmin && !member.isTeacher)) {
        notFound();
    }

    const isEditingSelf = authResult.session.user.id === member.id;
    const googleLinked = await isGoogleAccountLinked(member.id);
    const canUnlinkGoogle = await hasCredentialAccount(member.id);
    const googleAuthEnabled = isGoogleAuthConfigured();
    const cancelHref = isEditingSelf ? "/admin" : "/admin/equipe";

    return (
        <Page>
                <Section>
                    <TitlePage
                        title={`Editar ${member.name}`}
                        description="Atualize os dados e acessos deste membro da equipe."
                    />
                </Section>

                <Section className="mt-8">
                    <EditMemberForm
                        member={member}
                        isEditingSelf={isEditingSelf}
                        canWrite={userCanWrite(authResult.session.user)}
                        googleLinked={googleLinked}
                        canUnlinkGoogle={canUnlinkGoogle}
                        googleAuthEnabled={googleAuthEnabled}
                        cancelHref={cancelHref}
                    />
                </Section>
            </Page>
    );
}

export default function AdminEditMemberPage({
    params,
}: PageProps<"/admin/equipe/[memberId]/editar">) {
    return (
        <Suspense fallback={<SkeletonForm />}>
            <AdminEditMemberPageContent params={params} />
        </Suspense>
    );
}
