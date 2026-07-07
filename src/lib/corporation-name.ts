export function getCorporationName(): string {
    return process.env.NEXT_PUBLIC_NAME_CORPORATION?.trim() || "Luna Edu";
}
