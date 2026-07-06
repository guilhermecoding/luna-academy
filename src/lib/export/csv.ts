import type { ExportColumnDef } from "@/lib/export/columns";

const UTF8_BOM = "\uFEFF";

export type CsvColumnDef<T> = ExportColumnDef<T>;

export function escapeCsvValue(value: string, delimiter: string): string {
    const needsQuotes = value.includes(delimiter) || value.includes("\"") || value.includes("\n") || value.includes("\r");
    if (!needsQuotes) {
        return value;
    }

    return `"${value.replace(/"/g, "\"\"")}"`;
}

export function serializeCsv<T>(
    rows: T[],
    columns: CsvColumnDef<T>[],
    options?: { delimiter?: "," | ";" },
): string {
    const delimiter = options?.delimiter ?? ",";
    const headerLine = columns.map((column) => escapeCsvValue(column.header, delimiter)).join(delimiter);
    const dataLines = rows.map((row) =>
        columns
            .map((column) => {
                const raw = column.value(row);
                const value = raw === null || raw === undefined ? "" : String(raw);
                return escapeCsvValue(value, delimiter);
            })
            .join(delimiter),
    );

    return [headerLine, ...dataLines].join("\n");
}

export function createCsvResponse(content: string, filename: string): Response {
    const body = `${UTF8_BOM}${content}`;

    return new Response(body, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
