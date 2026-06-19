import Page from "@/components/page";
import Section from "@/components/section";
import { IconUserShield, IconPlus, IconUserCheck, IconUserX } from "@tabler/icons-react";
import { Metadata } from "next";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { AdminsTable } from "./_components/admins-table";
import { getAdmins, getAdminStats } from "@/services/users/admins.service";
import InfoBoxUsers from "../_components/info-box-users";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { requireAdmin, userCanWrite } from "@/lib/auth-guards";

export const metadata: Metadata = {
    title: "Administradores",
};

async function AdminAdministratorsPageContent({
    searchParams,
}: PageProps<"/admin/equipe/administradores">) {
    const authResult = await requireAdmin();
    if (!authResult.ok) return null;
    const canWrite = userCanWrite(authResult.session.user);

    const { q } = await searchParams;
    const searchQuery = typeof q === "string" ? q : undefined;

    const [session, adminsList, adminStats] = await Promise.all([
        auth.api.getSession({ headers: await headers() }),
        getAdmins(searchQuery),
        getAdminStats(),
    ]);
    const currentUserId = session?.user?.id ?? null;

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconUserShield className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Administradores</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Administradores"
                            description="Gerencie os administradores com acesso ao sistema da sua instituição."
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        {canWrite && (
                            <ButtonLink className="w-full sm:w-auto" href="/admin/equipe/administradores/novo">
                                <IconPlus className="size-4" />
                                Adicionar Administrador
                            </ButtonLink>
                        )}
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <InfoBoxUsers
                    label="TOTAL"
                    value={adminStats.totalAdmins}
                    color="indigo"
                    icon={<IconUserShield className="size-full" />}
                />
                <InfoBoxUsers
                    label="ATIVOS"
                    value={adminStats.activeAdmins}
                    color="emerald"
                    icon={<IconUserCheck className="size-full" />}
                />
                <InfoBoxUsers
                    label="INATIVOS"
                    value={adminStats.inactiveAdmins}
                    color="amber"
                    icon={<IconUserX className="size-full" />}
                />
            </Section>

            <Section className="mt-8">
                <div className="bg-surface border border-surface-border p-6 rounded-3xl">
                    <AdminsTable
                        data={adminsList}
                        currentUserId={currentUserId}
                        title={
                            <h2 className="text-xl font-bold text-foreground">
                                Todos os administradores
                            </h2>
                        }
                    />
                </div>
            </Section>
        </Page>
    );
}

export default function AdminAdministratorsPage({
    params,
    searchParams,
}: PageProps<"/admin/equipe/administradores">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <AdminAdministratorsPageContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
