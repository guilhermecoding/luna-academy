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
import thumb07 from "@/assets/images/thumbs-login-page/Imagem_07.webp";
import thumb08 from "@/assets/images/thumbs-login-page/Imagem_08.webp";
import { auth, isGoogleAuthConfigured } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APP_VERSION } from "@/lib/app-version";
import { Separator } from "@/components/ui/separator";

const loginThumbs = [thumb01, thumb02, thumb03, thumb04, thumb05, thumb06, thumb07, thumb08];

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ oauth?: string }>;
}) {
    const { oauth } = await searchParams;
    const isGoogleOAuthCallback = oauth === "google";

    const session = await auth.api.getSession({
        headers: await headers(),
        query: {
            disableCookieCache: true,
        },
    });

    if (session?.user && !isGoogleOAuthCallback) {
        if (session.user.isActive) {
            if (session.user.isTeacher && !session.user.isAdmin) {
                redirect("/prof");
            }
            redirect("/admin");
        }
    }

    const logoCorporation = process.env.NEXT_PUBLIC_LOGO_CORPORATION;
    const randomThumb = loginThumbs[randomInt(loginThumbs.length)];
    const googleAuthEnabled = isGoogleAuthConfigured();

    return (
        <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-surface">
            {/* Lado Esquerdo - Imagem (Escondido em Mobile) */}
            <div className="hidden lg:block relative overflow-hidden pointer-events-none">
                <Image src={randomThumb} alt="Background" fill sizes="50vw" className="object-cover" priority />
            </div>

            {/* Lado Direito - Formulário */}
            <div className="flex w-full flex-col items-center justify-start lg:justify-center py-3">
                <div className="w-full flex flex-col justify-center items-center space-y-2">
                    {/* Header */}
                    <div className="flex w-full flex-col items-center text-center space-y-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex flex-row items-center gap-4">
                                <GibbyAnimate className="w-5 h-5" />
                                <Separator
                                    orientation="vertical"
                                    className="h-20 my-auto mr-1.5 border border-muted-foreground/50 shrink-0"
                                />
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
                    <p className="text-center w-full sm:w-3/5 flex justify-center items-center max-w-sm text-xs text-muted-foreground">
                        &copy; <CurrentYear /> Luna Academy - v{APP_VERSION}. <br /> Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </main>
    );
}