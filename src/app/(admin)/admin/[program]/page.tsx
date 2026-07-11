import { redirect } from "next/navigation";
import { Suspense } from "react";

async function AdminProgramPageContent({
    params,
}: Omit<PageProps<"/admin/[program]">, "searchParams">) {
    const { program } = await params;
    redirect(`/admin/${program}/periodos`);
    return null;
}


export default function AdminProgramPage({
    params,
}: PageProps<"/admin/[program]">) {
    return (
        <Suspense fallback={null}>
            <AdminProgramPageContent params={params} />
        </Suspense>
    );
}   