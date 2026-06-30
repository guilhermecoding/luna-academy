import path from "node:path";

export function getPdfLogoSrc(): string {
    if (typeof window !== "undefined") {
        return "/luna-logo-full.png";
    }

    return path.join(process.cwd(), "public", "luna-logo-full.png");
}

export function getPdfFontPath(filename: string): string {
    if (typeof window !== "undefined") {
        return `/fonts/${filename}`;
    }

    return path.join(process.cwd(), "public", "fonts", filename);
}
