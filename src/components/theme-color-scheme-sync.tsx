"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

/**
 * Mantém color-scheme com modificador "only" após hidratação do next-themes.
 * O "only" impede o Chrome Android de aplicar escurecimento automático.
 */
export function ThemeColorSchemeSync() {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        document.documentElement.style.colorScheme =
            resolvedTheme === "dark" ? "only dark" : "only light";
    }, [resolvedTheme]);

    return null;
}
