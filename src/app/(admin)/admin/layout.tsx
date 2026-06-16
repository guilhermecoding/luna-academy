import { Metadata } from "next";
import { redirect } from "next/navigation";

import SidebarAdminBase from "./_components/sidebar-admin/sidebar-admin-base";
import { adminMenus } from "../_config/menus/admin-menus";
import { Suspense } from "react";
import SidebarAndPageSkeleton from "@/components/skeletons/sidebar-and-page-skeleton";
import { requireAdmin } from "@/lib/auth-guards";

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

    return (
        <Suspense fallback={<SidebarAndPageSkeleton />}>
            <SidebarAdminBase menus={adminMenus}>
                {children}
            </SidebarAdminBase>
        </Suspense>
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
