"use client";

import { DualArc } from "@/components/dual-arc";
import GibbyAnimate from "@/components/gibby-animate";
import { APP_VERSION } from "@/lib/app-version";
import { IconHeartFilled } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";

const INTRO_STORAGE_KEY = "luna-intro-shown";
const INTRO_DURATION_MS = 2400;
const LOADING_DELAY_MS = 7000;

function subscribe() {
    return () => { };
}

function getIntroAlreadyShown() {
    return sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
}

function getServerIntroAlreadyShown() {
    return true;
}

export function IntroSplash() {
    const introAlreadyShown = useSyncExternalStore(
        subscribe,
        getIntroAlreadyShown,
        getServerIntroAlreadyShown,
    );
    const [dismissed, setDismissed] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const visible = !introAlreadyShown && !dismissed;

    useEffect(() => {
        if (!visible) {
            return;
        }

        const dismissTimer = window.setTimeout(() => {
            sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
            setDismissed(true);
        }, INTRO_DURATION_MS);

        const loadingTimer = window.setTimeout(() => {
            setShowLoading(true);
        }, LOADING_DELAY_MS);

        return () => {
            window.clearTimeout(dismissTimer);
            window.clearTimeout(loadingTimer);
        };
    }, [visible]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="intro-splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="fixed inset-0 z-100 flex items-center justify-center bg-background"
                    role="status"
                    aria-live="polite"
                    aria-label="LUNA ACADEMY"
                    suppressHydrationWarning
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="flex flex-col items-center gap-4 text-center"
                    >
                        <GibbyAnimate className="size-24" />
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.35 }}
                            className="font-silkscreen text-primary-theme flex flex-col items-center gap-1"
                        >
                            <h1 className="text-6xl tracking-wide sm:text-7xl">
                                LUNA
                            </h1>
                            <p className="text-4xl font-semibold tracking-[0.3em] uppercase sm:text-5xl">
                                ACADEMY
                            </p>
                        </motion.div>
                        <div className="mt-6 flex flex-col items-center gap-2">
                            <span className="flex text-sm md:text-base flex-row items-center shrink-0 text-muted-foreground">
                                Feito com <IconHeartFilled className="size-7 shrink-0 px-1" /> por <strong>&nbsp;João Guilherme</strong>
                            </span>
                            <p className="text-sm text-center text-muted-foreground">
                                v{APP_VERSION}
                            </p>
                        </div>
                        {visible && showLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6"
                            >
                                <DualArc className="size-10 border-4 text-muted-foreground" />
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
