import type { Metadata, Viewport } from "next";
import { Poppins, Silkscreen } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/provider/providers";
import { Suspense } from "react";
import { FeedBackToast } from "@/components/feedback-toast";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-poppins",
});

const silkscreen = Silkscreen({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-silkscreen",
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

const APP_NAME = "LUNA ACADEMY";

export const metadata: Metadata = {
    title: {
        template: `%s | ${APP_NAME}`,
        default: `${APP_NAME} - Plataforma de Gestão Acadêmica`,
    },
    description: "Gerencie, acompanhe e otimize o desempenho dos seus alunos com o Luna, a plataforma de gestão acadêmica definitiva.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    openGraph: {
        title: `${APP_NAME} - Plataforma de Gestão Acadêmica`,
        description: "Gerencie, acompanhe e otimize o desempenho dos seus alunos com o Luna, a plataforma de gestão acadêmica definitiva.",
        url: process.env.NEXT_PUBLIC_APP_URL,
        siteName: APP_NAME,
        images: [
            {
                url: "og-image.jpg",
            },
        ],
        locale: "pt-BR",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html
            lang="pt-BR"
            className={cn("h-full", "antialiased", poppins.variable, silkscreen.variable)}
            suppressHydrationWarning
        >
            <body>
                <Providers>
                    <Suspense fallback={null}>
                        <FeedBackToast />
                    </Suspense>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
