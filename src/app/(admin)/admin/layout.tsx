import { Metadata } from "next";
import { redirect } from "next/navigation";

import SidebarAdminBase from "./_components/sidebar-admin/sidebar-admin-base";
import { adminMenus } from "../_config/menus/admin-menus";
import { Suspense } from "react";
import SidebarAndPageSkeleton from "@/components/skeletons/sidebar-and-page-skeleton";
import { requireAdmin, userCanWrite } from "@/lib/auth-guards";
import { WriteAccessProvider } from "@/components/write-access-provider";

export const metadata: Metadata = {
    title: {
        template: "%s | LUNA ACADEMY (Admin)",
        default: "Administrador",
    },
    robots: {
        index: false,
        follow: false,
    },
};

async function AdminLayoutContent({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const authResult = await requireAdmin();
    if (!authResult.ok) {
        redirect("/entrar");
    }

    const canWrite = userCanWrite(authResult.session.user);

    return (
        <WriteAccessProvider canWrite={canWrite}>
            <Suspense fallback={<SidebarAndPageSkeleton />}>
                <SidebarAdminBase menus={adminMenus}>
                    {children}
                </SidebarAdminBase>
            </Suspense>
        </WriteAccessProvider>
    );
}

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AdminLayoutContent>
            {children}
        </AdminLayoutContent>
    );
}
