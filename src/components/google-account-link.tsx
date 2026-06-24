"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";
import googleIcon from "@/assets/images/icons/google-icon.png";
import {
    buildGoogleCallbackUrl,
    GOOGLE_AUTH_GENERIC_ERROR_MESSAGE,
    logGoogleAuthError,
    warnGoogleAuthMisconfiguration,
} from "@/lib/google-auth";

type GoogleAccountLinkProps = {
    isLinked: boolean;
    callbackPath: string;
    enabled: boolean;
};

export default function GoogleAccountLink({
    isLinked,
    callbackPath,
    enabled,
}: GoogleAccountLinkProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const hasLinkError = searchParams.get("google_error") === "1";
        const hasLinkSuccess = searchParams.get("google_linked") === "1";

        if (!hasLinkError && !hasLinkSuccess) {
            return;
        }

        if (hasLinkError) {
            logGoogleAuthError("linkSocial callback", "google_error");
            toast.error(GOOGLE_AUTH_GENERIC_ERROR_MESSAGE);
        } else {
            toast.success("Conta Google vinculada com sucesso!");
            router.refresh();
        }

        const params = new URLSearchParams(searchParams.toString());
        params.delete("google_error");
        params.delete("google_linked");

        const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(nextUrl, { scroll: false });
    }, [pathname, router, searchParams]);

    async function handleLinkGoogle() {
        if (!enabled) {
            warnGoogleAuthMisconfiguration();
            toast.error(GOOGLE_AUTH_GENERIC_ERROR_MESSAGE);
            return;
        }

        setLoading(true);
        try {
            const { error } = await authClient.linkSocial({
                provider: "google",
                callbackURL: buildGoogleCallbackUrl(callbackPath, { google_linked: "1" }),
                errorCallbackURL: buildGoogleCallbackUrl(callbackPath, { google_error: "1" }),
            });

            if (error) {
                logGoogleAuthError("linkSocial", error);
                toast.error(GOOGLE_AUTH_GENERIC_ERROR_MESSAGE);
            }
        } catch (error) {
            logGoogleAuthError("linkSocial", error);
            toast.error(GOOGLE_AUTH_GENERIC_ERROR_MESSAGE);
        } finally {
            setLoading(false);
        }
    }

    if (!enabled) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-xl font-bold text-foreground">Conta Google</h3>
            {isLinked ? (
                <p className="text-sm text-muted-foreground">
                    Sua conta Google está vinculada. Você pode entrar com o Google na tela de login.
                </p>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">
                        Vincule sua conta Google para entrar sem senha. O e-mail do Google deve ser o mesmo cadastrado aqui.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto bg-transparent hover:bg-background border border-muted-foreground/50 gap-2"
                        onClick={handleLinkGoogle}
                        disabled={loading}
                        aria-busy={loading}
                    >
                        {loading ? (
                            <IconLoader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Image
                                src={googleIcon}
                                alt="Google"
                                width={20}
                                height={20}
                                className="w-5 h-auto object-contain"
                            />
                        )}
                        Vincular conta Google
                    </Button>
                </>
            )}
        </div>
    );
}
