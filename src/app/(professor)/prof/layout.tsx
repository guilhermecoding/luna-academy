import { Metadata } from "next";
import { redirect } from "next/navigation";

import SidebarProfBase from "./_components/sidebar-prof/sidebar-prof-base";
import { profMenus } from "../_config/menus/prof-menus";
import { Suspense } from "react";
import SidebarAndPageSkeleton from "@/components/skeletons/sidebar-and-page-skeleton";
import { requireTeacher, userCanWrite } from "@/lib/auth-guards";
import { WriteAccessProvider } from "@/components/write-access-provider";

export const metadata: Metadata = {
    title: {
        template: "%s | LUNA ACADEMY (Professor)",
        default: "Professor",
    },
    robots: {
        index: false,
        follow: false,
    },
};

async function TeacherLayoutContent({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const authResult = await requireTeacher();
    if (!authResult.ok) {
        redirect("/entrar");
    }

    const canWrite = userCanWrite(authResult.session.user);

    return (
        <WriteAccessProvider canWrite={canWrite}>
            <Suspense fallback={<SidebarAndPageSkeleton />}>
                <SidebarProfBase menus={profMenus}>
                    {children}
                </SidebarProfBase>
            </Suspense>
        </WriteAccessProvider>
    );
}

export default function TeacherLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <TeacherLayoutContent>{children}</TeacherLayoutContent>;
}
