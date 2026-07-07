"use client";

import { DualArc } from "@/components/dual-arc";
import { useIntroSplashPending } from "@/lib/intro-splash-state";
import Image from "next/image";

export function GlobalLoading() {
    const introPending = useIntroSplashPending();

    if (introPending) {
        return null;
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-6">
                <Image
                    src="/gibby-normal-icon.svg"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="pointer-events-none h-28 w-28 opacity-70 brightness-150 grayscale-90"
                    loading="eager"
                />
                <DualArc className="size-10 text-primary/40" />
            </div>
        </div>
    );
}
