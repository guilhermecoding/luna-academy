"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { TeachersListPdfDocument } from "@/lib/export/pdf/teachers-list-document";
import type { ExportColumnDef } from "@/lib/export/columns";
import { useSyncExternalStore } from "react";

function useIsClient() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
}

export type TeachersPdfPreviewProps<T> = {
    title: string;
    subtitle: string;
    generatedAt: string;
    rows: T[];
    columns: ExportColumnDef<T>[];
};

export function TeachersPdfPreview<T>({
    title,
    subtitle,
    generatedAt,
    rows,
    columns,
}: TeachersPdfPreviewProps<T>) {
    const isClient = useIsClient();

    if (!isClient) {
        return (
            <div className="flex h-full min-h-[calc(100vh-140px)] items-center justify-center text-sm text-muted-foreground">
                Carregando pré-visualização...
            </div>
        );
    }

    return (
        <PDFViewer
            width="100%"
            height="100%"
            style={{ minHeight: "calc(100vh - 140px)", border: "none" }}
            showToolbar
        >
            <TeachersListPdfDocument
                title={title}
                subtitle={subtitle}
                generatedAt={generatedAt}
                rows={rows}
                columns={columns}
            />
        </PDFViewer>
    );
}
