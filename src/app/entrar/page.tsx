import { randomInt } from "node:crypto";
import Image from "next/image";
import LoginForm from "./_components/login-form";
import GibbyAnimate from "@/components/gibby-animate";
import CorporationLogo from "@/app/entrar/_components/corporation-logo";
import CurrentYear from "@/app/entrar/_components/current-year";
import thumb01 from "@/assets/images/thumbs-login-page/Imagem_01.webp";
import thumb02 from "@/assets/images/thumbs-login-page/Imagem_02.webp";
import thumb03 from "@/assets/images/thumbs-login-page/Imagem_03.webp";
import thumb04 from "@/assets/images/thumbs-login-page/Imagem_04.webp";
import thumb05 from "@/assets/images/thumbs-login-page/Imagem_05.webp";
import thumb06 from "@/assets/images/thumbs-login-page/Imagem_06.webp";
import thumb08 from "@/assets/images/thumbs-login-page/Imagem_08.webp";
import thumb11 from "@/assets/images/thumbs-login-page/Imagem_11.webp";
import thumb12 from "@/assets/images/thumbs-login-page/Imagem_12.webp";
import { auth, isGoogleAuthConfigured } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { APP_VERSION } from "@/lib/app-version";
import { Separator } from "@/components/ui/separator";
import { LOGIN_TAB_COOKIE_NAME, loginRedirectPath } from "@/lib/login-session";
import { Suspense } from "react";

const loginThumbs = [thumb01, thumb02, thumb03, thumb04, thumb05, thumb06, thumb08, thumb11, thumb12];

async function LoginPageContent({
    searchParams,
}: {
    searchParams?: Promise<{ oauth?: string }>;
}) {
    const { oauth } = (await searchParams) ?? {};
    const isGoogleOAuthCallback = oauth === "google";

    const session = await auth.api.getSession({
        headers: await headers(),
        query: {
            disableCookieCache: true,
        },
    });

    const cookieStore = await cookies();
    const tabFromCookie = cookieStore.get(LOGIN_TAB_COOKIE_NAME)?.value ?? null;

    if (session?.user && !isGoogleOAuthCallback) {
        const redirectPath = loginRedirectPath(session.user, tabFromCookie);
        if (redirectPath) {
            if (tabFromCookie) {
                cookieStore.set(LOGIN_TAB_COOKIE_NAME, "", { maxAge: 0, path: "/" });
            }
            redirect(redirectPath);
        }
    }

    const logoCorporation = process.env.NEXT_PUBLIC_LOGO_CORPORATION;
    const randomThumb = loginThumbs[randomInt(loginThumbs.length)];
    const googleAuthEnabled = isGoogleAuthConfigured();

    return (
        <main className="relative min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-surface">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[url('/bg-login.svg')] bg-cover bg-center bg-no-repeat opacity-60"
            />
            {/* Lado Esquerdo - Imagem (Escondido em Mobile) */}
            <div className="relative z-10 hidden lg:block overflow-hidden pointer-events-none">
                <Image src={randomThumb} alt="Background" fill sizes="50vw" className="object-cover" priority />
            </div>

            {/* Lado Direito - Formulário */}
            <div className="relative z-10 flex w-full h-min-screen flex-col items-center justify-center py-3">
                <div className="w-full flex flex-col justify-center items-center space-y-2">
                    {/* Header */}
                    <div className="flex w-full flex-col items-center text-center space-y-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex flex-row items-center gap-4">
                                <GibbyAnimate size={64} />
                                {logoCorporation &&
                                    <Separator
                                        orientation="vertical"
                                        className="h-16 my-auto mr-1 border border-muted-foreground/50 shrink-0"
                                    />}
                                <CorporationLogo logoCorporation={logoCorporation} />
                            </div>
                            <h2 className="font-silkscreen text-primary-theme text-5xl">LUNA</h2>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-base font-medium">
                                Bem-vindo(a) de volta!
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="w-full px-6 py-1 flex flex-col justify-center items-center gap-4">
                        <LoginForm googleAuthEnabled={googleAuthEnabled} />
                    </div>

                    {/* Footer opcional */}
                    <p className="text-center mt-8 w-full sm:w-3/5 flex justify-center items-center max-w-sm text-xs text-muted-foreground">
                        &copy; <CurrentYear /> Luna Academy - v{APP_VERSION}. <br /> Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage({
    searchParams,
}: {
    searchParams?: Promise<{ oauth?: string }>;
}) {
    return (
        <Suspense fallback={null}>
            <LoginPageContent searchParams={searchParams} />
        </Suspense>
    );
}