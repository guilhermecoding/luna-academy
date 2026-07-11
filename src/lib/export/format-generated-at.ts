import { APP_TIMEZONE } from "@/lib/get-day-key-in-time-zone";

export function formatExportGeneratedAt(date: Date = new Date()): string {
    return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: APP_TIMEZONE,
    });
}

/** Sufixo YYYY-MM-DD no fuso da aplicação (para nomes de arquivo de export). */
export function formatExportDateSuffix(date: Date = new Date()): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: APP_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}
