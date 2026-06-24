import type { SessionUser } from "@/@types/session-type";

export type LoginTab = "admin" | "teacher";
export type SessionUserLogin = Omit<SessionUser, "id">;

/**
 * Aba Professor: somente quem tem vínculo `isTeacher` no cadastro (inclui admin que também é professor).
 * Aba Admin: somente quem tem vínculo `isAdmin` no cadastro.
 */
export function sessionMatchesTab(activeTab: LoginTab, user: SessionUserLogin): boolean {
    if (activeTab === "teacher") {
        return user.isTeacher === true;
    }
    return user.isAdmin === true;
}

export type LoginSessionValidation =
    | { ok: true; user: SessionUserLogin }
    | { ok: false; reason: "no_user" | "inactive" | "tab_mismatch" };

export function validateLoginSession(
    user: SessionUserLogin | null,
    activeTab: LoginTab,
): LoginSessionValidation {
    if (!user) {
        return { ok: false, reason: "no_user" };
    }

    if (!user.isActive) {
        return { ok: false, reason: "inactive" };
    }

    if (!sessionMatchesTab(activeTab, user)) {
        return { ok: false, reason: "tab_mismatch" };
    }

    return { ok: true, user };
}

export async function fetchSessionUser(): Promise<SessionUserLogin | null> {
    const sessionRes = await fetch("/api/auth/get-session", {
        credentials: "include",
        cache: "no-store",
    });

    if (!sessionRes.ok) {
        return null;
    }

    const sessionBody = await sessionRes.json();
    if (
        sessionBody &&
        typeof sessionBody === "object" &&
        "user" in sessionBody &&
        sessionBody.user &&
        typeof sessionBody.user === "object"
    ) {
        return sessionBody.user as SessionUserLogin;
    }

    return null;
}
