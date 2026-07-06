"use client";

import { IntroAwareTopLoader } from "@/components/intro-aware-top-loader";
import { ThemeColorSchemeSync } from "@/components/theme-color-scheme-sync";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense } from "react";

/**
 * Componente de Providers para fornecer contextos globais.
 * @param children - Os componentes filhos que terão acesso aos contextos fornecidos.
 */
export default function Providers({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            enableColorScheme={false}
            disableTransitionOnChange
            storageKey="theme"
        >
            <ThemeColorSchemeSync />
            <IntroAwareTopLoader />
            <Suspense fallback={null}>
                <SidebarProvider>
                    <TooltipProvider>
                        {children}
                    </TooltipProvider>
                    <Toaster richColors position="top-right" />
                </SidebarProvider>
            </Suspense>
        </ThemeProvider>
    );
}
