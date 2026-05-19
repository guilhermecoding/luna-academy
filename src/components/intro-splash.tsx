"use client";

import GibbyAnimate from "@/components/gibby-animate";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";

const INTRO_STORAGE_KEY = "luna-intro-shown";
const INTRO_DURATION_MS = 2400;

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
    const visible = !introAlreadyShown && !dismissed;

    useEffect(() => {
        if (!visible) {
            return;
        }

        const timer = window.setTimeout(() => {
            sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
            setDismissed(true);
        }, INTRO_DURATION_MS);

        return () => window.clearTimeout(timer);
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
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
