import { requireAdmin } from "@/lib/auth-guards";
import { redirectIfReadOnlyUser } from "@/lib/read-only-routes";
import { redirect } from "next/navigation";

export async function WritePageGuard({
    redirectTo,
    memberId,
    children,
}: {
    redirectTo: string;
    memberId?: string;
    children: React.ReactNode;
}) {
    const authResult = await requireAdmin();
    if (!authResult.ok) redirect("/entrar");

    redirectIfReadOnlyUser(authResult.session.user, redirectTo, {
        memberId,
        allowSelfEdit: Boolean(memberId),
    });

    return children;
}
