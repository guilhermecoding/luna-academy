"use client";

import { useIntroSplashPending } from "@/lib/intro-splash-state";
import NextTopLoader from "nextjs-toploader";

export function IntroAwareTopLoader() {
    const introPending = useIntroSplashPending();

    if (introPending) {
        return null;
    }

    return (
        <NextTopLoader
            color="#432DD7"
            height={4}
            showSpinner={false}
            easing="ease"
            speed={200}
        />
    );
}
