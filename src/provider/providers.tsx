"use client";

import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
