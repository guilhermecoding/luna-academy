import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { SessionUser } from "@/@types/session-type";

type GuardFail = { ok: false; error: string };
type GuardOk = { ok: true; session: { user: SessionUser & { id: string } } };

export async function requireSession(): Promise<GuardOk | GuardFail> {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
        return { ok: false, error: "Não autorizado" };
    }

    if (!session.user.isActive) {
        return { ok: false, error: "Não autorizado" };
    }

    return { ok: true, session: { user: session.user as SessionUser & { id: string } } };
}

export async function requireAdmin(): Promise<GuardOk | GuardFail> {
    const result = await requireSession();
    if (!result.ok) return result;

    if (!result.session.user.isAdmin) {
        return { ok: false, error: "Não autorizado" };
    }

    return result;
}

export async function requireTeacher(): Promise<GuardOk | GuardFail> {
    const result = await requireSession();
    if (!result.ok) return result;

    if (!result.session.user.isTeacher) {
        return { ok: false, error: "Não autorizado" };
    }

    return result;
}
