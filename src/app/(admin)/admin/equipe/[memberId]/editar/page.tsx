import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { Metadata } from "next";
import { getUserById } from "@/services/users/users.service";
import { notFound } from "next/navigation";
import EditMemberForm from "./_components/edit-member-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import SkeletonForm from "@/components/skeletons/skeleton-form";

export const metadata: Metadata = {
    title: "Editar Membro",
};

async function AdminEditMemberPageContent({
    params,
}: Omit<PageProps<"/admin/equipe/[memberId]/editar">, "searchParams">) {
    const { memberId } = await params;
    const [member, session] = await Promise.all([
        getUserById(memberId),
        auth.api.getSession({ headers: await headers() }),
    ]);

    if (!member || (!member.isAdmin && !member.isTeacher)) {
        notFound();
    }

    const isEditingSelf = session?.user?.id === member.id;

    return (
        <Page>
            <Section>
                <TitlePage
                    title={`Editar ${member.name}`}
                    description="Atualize os dados e acessos deste membro da equipe."
                />
            </Section>

            <Section className="mt-8">
                <EditMemberForm member={member} isEditingSelf={isEditingSelf} />
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