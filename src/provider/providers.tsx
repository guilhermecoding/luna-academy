"use client";

import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeColorSchemeSync } from "@/components/theme-color-scheme-sync";
import { Suspense } from "react";
import NextTopLoader from "nextjs-toploader";

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
            <NextTopLoader
                color="#432DD7"
                height={4}
                showSpinner={false}
                easing="ease"
                speed={200}
            />
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
