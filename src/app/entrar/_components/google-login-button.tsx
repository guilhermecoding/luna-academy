"use client";

import { useState } from "react";
import Image from "next/image";
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
import type { LoginTab } from "@/lib/login-session";

type GoogleLoginButtonProps = {
    activeTab: LoginTab;
    enabled: boolean;
};

export default function GoogleLoginButton({ activeTab, enabled }: GoogleLoginButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleGoogleSignIn() {
        if (!enabled) {
            warnGoogleAuthMisconfiguration();
            toast.error(GOOGLE_AUTH_GENERIC_ERROR_MESSAGE);
            return;
        }

        setLoading(true);
        try {
            const { error } = await authClient.signIn.social({
                provider: "google",
                callbackURL: buildGoogleCallbackUrl("/entrar", {
                    tab: activeTab,
                    oauth: "google",
                }),
                errorCallbackURL: buildGoogleCallbackUrl("/entrar", { tab: activeTab }),
            });

            if (error) {
                logGoogleAuthError("signIn.social", error);
                toast.error(GOOGLE_AUTH_GENERIC_ERROR_MESSAGE);
            }
        } catch (error) {
            logGoogleAuthError("signIn.social", error);
            toast.error(GOOGLE_AUTH_GENERIC_ERROR_MESSAGE);
        } finally {
            setLoading(false);
        }
    }

    if (!enabled) {
        return null;
    }

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent hover:bg-background border border-muted-foreground/50 gap-2"
            onClick={handleGoogleSignIn}
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
            Entre com o Google
        </Button>
    );
}
