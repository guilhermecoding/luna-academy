import { IconUsers, IconUserShield, IconBriefcase, IconShieldChevron } from "@tabler/icons-react";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { getUserStats, getUsersList } from "@/services/users/users.service";
import InfoBoxUsers from "./_components/info-box-users";
import { TeamTable } from "./_components/team-table";
import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { requireAdmin } from "@/lib/auth-guards";

export const metadata: Metadata = {
    title: "Equipe",
};

async function AdminUsersPageContent({
    searchParams,
}: PageProps<"/admin/equipe">) {
    const authResult = await requireAdmin();
    if (!authResult.ok) return null;

    const { q } = await searchParams;
    const searchQuery = typeof q === "string" ? q : undefined;

    const [userStats, usersList] = await Promise.all([
        getUserStats(),
        getUsersList(searchQuery),
    ]);
    const currentUserId = authResult.session.user.id;

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconUsers className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Equipe</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Membros da Equipe"
                            description="Gerencie todos os membros da equipe da sua instituição."
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-1 gap-2 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid" href="/admin/equipe/administradores">
                            <IconUserShield className="size-5" />
                            Administradores
                        </ButtonLink>
                        <ButtonLink className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid" href="/admin/equipe/professores">
                            <IconBriefcase className="size-5" />
                            Professores
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <InfoBoxUsers
                    label="TOTAL DE MEMBROS"
                    value={userStats.totalUsers}
                    color="emerald"
                    icon={<IconUsers className="size-full" />}
                    className="col-span-1 sm:col-span-2 md:col-span-1"
                />
                <InfoBoxUsers
                    label="ADMINISTRADORES"
                    value={userStats.totalAdmins}
                    color="rose"
                    icon={<IconUserShield className="size-full" />}
                    href="/admin/equipe/administradores"
                    labelLink="Todos os administradores"
                />
                <InfoBoxUsers
                    label="PROFESSORES"
                    value={userStats.totalTeachers}
                    color="amber"
                    icon={<IconBriefcase className="size-full" />}
                    href="/admin/equipe/professores"
                    labelLink="Todos os professores"
                />
            </Section>

            <Section className="mt-8">
                <div className="bg-surface border border-surface-border p-6 rounded-3xl">
                    <TeamTable
                        data={usersList}
                        currentUserId={currentUserId}
                        title={
                            <h2 className="text-xl flex flex-row items-center gap-2 font-bold text-foreground">
                                <IconShieldChevron className="size-6" />
                                Todos os membros
                            </h2>
                        }
                    />
                </div>
            </Section>
        </Page>
    );
}

export default function AdminUsersPage({
    params,
    searchParams,
}: PageProps<"/admin/equipe">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <AdminUsersPageContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}