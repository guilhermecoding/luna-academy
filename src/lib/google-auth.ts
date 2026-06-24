export const GOOGLE_AUTH_LINK_ERROR_MESSAGE =
    "não há nenhum vinculo com essa conta aqui registrado.";

export const GOOGLE_AUTH_GENERIC_ERROR_MESSAGE =
    "Ocorre um erro por esse método de login. Vamos resolver isso.";

const GOOGLE_LINK_QUERY_ERRORS = new Set(["account_not_linked", "signup_disabled"]);

export function isGoogleAuthConfigured(): boolean {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function warnGoogleAuthMisconfiguration(): void {
    console.warn("variaveis de autenticação do Google não declaradas");
}

export function logGoogleAuthError(context: string, error: unknown): void {
    console.error(`[Google Auth] ${context}`, error);
}

export function mapGoogleOAuthQueryError(error: string | null): {
    userMessage: string;
    shouldLog: boolean;
} {
    if (!error) {
        return { userMessage: GOOGLE_AUTH_GENERIC_ERROR_MESSAGE, shouldLog: true };
    }

    if (GOOGLE_LINK_QUERY_ERRORS.has(error)) {
        return { userMessage: GOOGLE_AUTH_LINK_ERROR_MESSAGE, shouldLog: true };
    }

    return { userMessage: GOOGLE_AUTH_GENERIC_ERROR_MESSAGE, shouldLog: true };
}

/**
 * Better Auth valida callbackURL contra trustedOrigins e rejeita query strings
 * com caracteres fora do permitido (ex.: "!"). URLs absolutas com params simples evitam isso.
 */
export function buildGoogleCallbackUrl(
    path: string,
    params?: Record<string, string>,
): string {
    const origin =
        typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_APP_URL ||
              process.env.BETTER_AUTH_URL ||
              "http://localhost:3000";

    const url = new URL(path, origin);

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
    }

    return url.toString();
}
