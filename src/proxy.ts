import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    // Chama o banco diretamente via Better Auth (sem round-trip HTTP)
    // Lê o cookie de sessão a partir dos headers da requisição
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Sem sessão válida → redireciona para login
    if (!session) {
        return NextResponse.redirect(new URL("/entrar", request.url));
    }

    const { user } = session;

    if (!user.isActive) {
        const response = NextResponse.redirect(new URL("/entrar?error=account_disabled", request.url));
        response.cookies.delete("better-auth.session_token");
        return response;
    }

    const path = request.nextUrl.pathname;

    // Rotas /admin: exige a flag isAdmin verdadeira
    if (path.startsWith("/admin") && !user.isAdmin) {
        return NextResponse.redirect(new URL("/entrar", request.url));
    }

    // Rotas /prof: exclusivo para professores
    if (path.startsWith("/prof") && !user.isTeacher) {
        return NextResponse.redirect(new URL("/entrar", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin", "/admin/:path*", "/prof", "/prof/:path*"],
};
