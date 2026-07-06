import path from "node:path";

export function getPdfLogoSrc(): string {
    if (typeof window !== "undefined") {
        return "/luna-logo-full.png";
    }

    // Caminho relativo ao cwd: evita que url.parse trate "C:\..." como protocolo no Windows.
    return path.join("public", "luna-logo-full.png");
}

export function getPdfFontPath(filename: string): string {
    if (typeof window !== "undefined") {
        return `/fonts/${filename}`;
    }

    return path.join(process.cwd(), "public", "fonts", filename);
}
