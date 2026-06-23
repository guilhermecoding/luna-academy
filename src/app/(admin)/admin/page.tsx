import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { Suspense } from "react";
import AdminRedirectClient from "./_components/admin-redirect-client";

const ACTIVE_PROGRAM_COOKIE_NAME = "active_program_slug";

async function fetchPrograms() {
    return prisma.program.findMany({
        orderBy: { name: "asc" },
    });
}

async function AdminRedirect() {
    const programs = await fetchPrograms();

    if (programs.length === 0) {
        return <AdminRedirectClient targetUrl="/admin/programas" />;
    }

    const cookieStore = await cookies();
    const activeSlug = cookieStore.get(ACTIVE_PROGRAM_COOKIE_NAME)?.value;

    const activeProgram = programs.find((p) => p.slug === activeSlug);
    const targetSlug = activeProgram?.slug ?? programs[0].slug;

    return <AdminRedirectClient targetUrl={`/admin/${targetSlug}/periodos`} />;
}

export default function AdminPage() {
    return (
        <Suspense fallback={null}>
            <AdminRedirect />
        </Suspense>
    );
}