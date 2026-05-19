import type { Metadata, Viewport } from "next";
import { Poppins, Silkscreen } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/provider/providers";
import { Suspense } from "react";
import { FeedBackToast } from "@/components/feedback-toast";
import { SerwistProvider } from "@serwist/turbopack/react";

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
    themeColor: "#ffffff",
};

const APP_NAME = "LUNA ACADEMY";

export const metadata: Metadata = {
    manifest: "/manifest.webmanifest",
    title: {
        template: `%s | ${APP_NAME}`,
        default: `${APP_NAME} - Plataforma de Gestão Acadêmica`,
    },
    applicationName: APP_NAME,
    description: "Gerencie, acompanhe e otimize o desempenho dos seus alunos com o Luna, a plataforma de gestão acadêmica definitiva.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    authors: [{
        name: "Joao Guilherme",
        url: "https://www.linkedin.com/in/jo%C3%A3o-guilherme-ara%C3%BAjo-viana",
    }],
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
    keywords: ["luna", "academy", "gestão", "academica", "escola", "educação", "educação superior", "educação profissional", "educação técnica", "educação infantil", "educação básica", "educação superior", "educação profissional", "educação técnica", "educação infantil", "educação básica", "educação superior", "educação profissional", "educação técnica", "educação infantil", "educação básica"],
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
            <head>
                <link rel="manifest" href="/manifest.webmanifest" />
            </head>
            <body>
                <SerwistProvider
                    swUrl="/serwist/sw.js"
                    disable={process.env.NODE_ENV === "development"}
                >
                    <Providers>
                        <Suspense fallback={null}>
                            <FeedBackToast />
                        </Suspense>
                        {children}
                    </Providers>
                </SerwistProvider>
            </body>
        </html>
    );
}
