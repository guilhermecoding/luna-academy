import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { SessionUser } from "@/@types/session-type";
import { SYSTEM_ROLE } from "@/@types/system-role.type";

type GuardFail = { ok: false; error: string };
type GuardOk = { ok: true; session: { user: SessionUser & { id: string } } };

/**
 * Valida a sessão atual do usuário autenticado.
 *
 * @returns `{ ok: true, session }` quando há sessão ativa com usuário válido;
 * `{ ok: false, error }` quando não há sessão, o usuário está inativo ou não autorizado.
 */
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

/**
 * Exige sessão válida e perfil de administrador.
 *
 * @returns `{ ok: true, session }` quando o usuário é admin ativo;
 * `{ ok: false, error }` quando a sessão falha ou o usuário não é admin.
 */
export async function requireAdmin(): Promise<GuardOk | GuardFail> {
    const result = await requireSession();
    if (!result.ok) return result;

    if (!result.session.user.isAdmin) {
        return { ok: false, error: "Não autorizado" };
    }

    return result;
}

/**
 * Exige sessão válida e perfil de professor.
 *
 * @returns `{ ok: true, session }` quando o usuário é professor ativo;
 * `{ ok: false, error }` quando a sessão falha ou o usuário não é professor.
 */
export async function requireTeacher(): Promise<GuardOk | GuardFail> {
    const result = await requireSession();
    if (!result.ok) return result;

    if (!result.session.user.isTeacher) {
        return { ok: false, error: "Não autorizado" };
    }

    return result;
}

/**
 * Verifica se o usuário possui papel de sistema somente leitura.
 *
 * @param user Usuário (ou fragmento) contendo `systemRole`.
 * @returns `true` quando `systemRole` é `READ_ONLY`; caso contrário, `false`.
 */
export function isReadOnly(user: Pick<SessionUser, "systemRole">): boolean {
    return user.systemRole === SYSTEM_ROLE.READ_ONLY;
}

/**
 * Verifica se o usuário pode realizar operações de escrita.
 *
 * @param user Usuário (ou fragmento) contendo `systemRole`.
 * @returns `true` quando o usuário não é somente leitura; `false` quando é `READ_ONLY`.
 */
export function userCanWrite(user: Pick<SessionUser, "systemRole">): boolean {
    return !isReadOnly(user);
}

/**
 * Exige sessão válida, perfil de administrador e permissão de escrita.
 *
 * @returns `{ ok: true, session }` quando o admin pode escrever;
 * `{ ok: false, error }` quando a sessão falha, não é admin ou é somente leitura.
 */
export async function requireAdminWrite(): Promise<GuardOk | GuardFail> {
    const result = await requireAdmin();
    if (!result.ok) return result;

    if (isReadOnly(result.session.user)) {
        return { ok: false, error: "Acesso somente leitura." };
    }

    return result;
}

/**
 * Exige sessão válida, perfil de professor e permissão de escrita.
 *
 * @returns `{ ok: true, session }` quando o professor pode escrever;
 * `{ ok: false, error }` quando a sessão falha, não é professor ou é somente leitura.
 */
export async function requireTeacherWrite(): Promise<GuardOk | GuardFail> {
    const result = await requireTeacher();
    if (!result.ok) return result;

    if (isReadOnly(result.session.user)) {
        return { ok: false, error: "Acesso somente leitura." };
    }

    return result;
}
