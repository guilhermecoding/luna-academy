"use client";

import { useSyncExternalStore } from "react";

export const INTRO_STORAGE_KEY = "luna-intro-shown";

const listeners = new Set<() => void>();

export function subscribeIntroSplash(callback: () => void) {
    listeners.add(callback);
    return () => {
        listeners.delete(callback);
    };
}

export function notifyIntroSplashListeners() {
    for (const listener of listeners) {
        listener();
    }
}

export function getIntroSplashDismissed() {
    return sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
}

function getServerIntroSplashDismissed() {
    // No servidor não sabemos se a intro já rodou; suprimimos loadings globais.
    return false;
}

export function useIntroSplashDismissed() {
    return useSyncExternalStore(
        subscribeIntroSplash,
        getIntroSplashDismissed,
        getServerIntroSplashDismissed,
    );
}

export function useIntroSplashPending() {
    return !useIntroSplashDismissed();
}
