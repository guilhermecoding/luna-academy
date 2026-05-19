import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Entrar",
    robots: {
        index: true,
        follow: true,
    },
};

export default function LoginLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
