import type { SessionUser } from "@/@types/session-type";

export type LoginTab = "admin" | "teacher";
export type SessionUserLogin = Omit<SessionUser, "id">;

export const LOGIN_TAB_COOKIE_NAME = "luna_login_tab";
export const LOGIN_TAB_STORAGE_KEY = "luna_login_tab";

export function parseLoginTab(value: string | null): LoginTab {
    return value === "admin" ? "admin" : "teacher";
}

function readPersistedLoginTab(): LoginTab | null {
    if (typeof window === "undefined") {
        return null;
    }

    const fromStorage = sessionStorage.getItem(LOGIN_TAB_STORAGE_KEY);
    if (fromStorage === "admin" || fromStorage === "teacher") {
        return fromStorage;
    }

    const match = document.cookie.match(
        new RegExp(`(?:^|; )${LOGIN_TAB_COOKIE_NAME}=([^;]*)`),
    );
    const fromCookie = match?.[1];
    if (fromCookie === "admin" || fromCookie === "teacher") {
        return fromCookie;
    }

    return null;
}

/** Aba escolhida na tela de login (URL do callback OAuth, sessionStorage ou cookie). */
export function resolveLoginTab(value: string | null): LoginTab {
    if (value === "admin" || value === "teacher") {
        return value;
    }

    return readPersistedLoginTab() ?? "teacher";
}

export function persistLoginTab(tab: LoginTab): void {
    if (typeof window === "undefined") {
        return;
    }

    sessionStorage.setItem(LOGIN_TAB_STORAGE_KEY, tab);
    document.cookie = `${LOGIN_TAB_COOKIE_NAME}=${tab}; path=/; max-age=300; SameSite=Lax`;
}

export function clearPersistedLoginTab(): void {
    if (typeof window === "undefined") {
        return;
    }

    sessionStorage.removeItem(LOGIN_TAB_STORAGE_KEY);
    document.cookie = `${LOGIN_TAB_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Destino pós-login conforme a aba selecionada. Sem aba, mantém o fallback legado
 * (professor exclusivo → /prof; demais com admin → /admin).
 */
export function loginRedirectPath(
    user: SessionUserLogin,
    activeTab?: LoginTab | string | null,
): "/prof" | "/admin" | null {
    if (!user.isActive) {
        return null;
    }

    const tab =
        activeTab === "admin" ? "admin" : activeTab === "teacher" ? "teacher" : null;

    if (tab === "teacher" && user.isTeacher) {
        return "/prof";
    }

    if (tab === "admin" && user.isAdmin) {
        return "/admin";
    }

    if (user.isTeacher && !user.isAdmin) {
        return "/prof";
    }

    if (user.isAdmin) {
        return "/admin";
    }

    return null;
}

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
