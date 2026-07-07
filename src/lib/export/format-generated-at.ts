export function formatExportGeneratedAt(date: Date = new Date()): string {
    return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}
