"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { StudentsListPdfDocument } from "@/lib/export/pdf/students-list-document";
import type { StudentExportRow } from "@/services/export/students-export.config";
import { useSyncExternalStore } from "react";

function useIsClient() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
}

export type StudentsPdfPreviewProps = {
    title: string;
    subtitle: string;
    generatedAt: string;
    rows: StudentExportRow[];
};

export function StudentsPdfPreview({
    title,
    subtitle,
    generatedAt,
    rows,
}: StudentsPdfPreviewProps) {
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
            <StudentsListPdfDocument
                title={title}
                subtitle={subtitle}
                generatedAt={generatedAt}
                rows={rows}
            />
        </PDFViewer>
    );
}
