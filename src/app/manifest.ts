import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "LUNA ACADEMY",
        short_name: "LUNA ACADEMY",
        description: "Gerencie, acompanhe e otimize o desempenho dos seus alunos com o Luna, a plataforma de gestão acadêmica definitiva.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        orientation: "portrait",
        icons: [
            {
                src: "/web-app-manifest-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/web-app-manifest-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}