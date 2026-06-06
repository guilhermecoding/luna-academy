import { redirect } from "next/navigation";

export default async function AdminProgramPage({
    params,
}: PageProps<"/admin/[program]">) {
    const { program } = await params;
    redirect(`/admin/${program}/periodos`);
    return null;
}
