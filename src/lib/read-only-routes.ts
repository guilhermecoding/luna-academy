import type { SessionUser } from "@/@types/session-type";
import { redirect } from "next/navigation";
import { isReadOnly } from "@/lib/auth-guards";

/**
 * Redireciona usuários somente leitura para outra rota, exceto quando a edição do próprio perfil é permitida.
 *
 * @param user Usuário autenticado com `id`.
 * @param redirectTo Caminho de destino quando o acesso deve ser bloqueado.
 * @param options Opções de exceção: `memberId` do membro em edição e `allowSelfEdit` para liberar autoedição.
 * @returns `void`; chama `redirect()` quando o usuário é somente leitura e não se enquadra na exceção.
 */
export function redirectIfReadOnlyUser(
    user: SessionUser & { id: string },
    redirectTo: string,
    options?: { memberId?: string; allowSelfEdit?: boolean },
) {
    if (!isReadOnly(user)) return;

    if (options?.allowSelfEdit && options.memberId === user.id) {
        return;
    }

    redirect(redirectTo);
}

/**
 * Retorna a rota de listagem pai para redirect de usuários READ_ONLY
 * que tentam acessar rotas `/novo` ou `/editar`.
 *
 * @param pathname Caminho atual da requisição (ex.: `/admin/alunos/novo`).
 * @returns Caminho da listagem pai (ex.: `/admin/alunos`); `/admin` quando não há segmentos ou pai identificável.
 */
export function getReadOnlyRedirectPath(pathname: string): string {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
        return "/admin";
    }

    const novoIndex = segments.lastIndexOf("novo");
    const editarIndex = segments.lastIndexOf("editar");
    const writeIndex = Math.max(novoIndex, editarIndex);

    if (writeIndex === -1) {
        return `/${segments.join("/")}`;
    }

    const parentSegments = segments.slice(0, writeIndex);
    return parentSegments.length > 0 ? `/${parentSegments.join("/")}` : "/admin";
}

/**
 * Verifica se o caminho corresponde à edição do próprio membro da equipe.
 *
 * @param pathname Caminho atual da requisição.
 * @param userId ID do usuário autenticado.
 * @returns `true` quando o pathname é `/admin/equipe/{userId}/editar` e o segmento coincide com `userId`.
 */
export function isSelfMemberEditPath(pathname: string, userId: string): boolean {
    const match = pathname.match(/^\/admin\/equipe\/([^/]+)\/editar\/?$/);
    return match?.[1] === userId;
}

/**
 * Indica se o caminho é uma rota de escrita (criação ou edição).
 *
 * @param pathname Caminho atual da requisição.
 * @returns `true` quando o pathname contém o segmento `novo` ou `editar`; caso contrário, `false`.
 */
export function isReadOnlyWriteRoute(pathname: string): boolean {
    return /\/(novo|editar)(\/|$)/.test(pathname);
}
