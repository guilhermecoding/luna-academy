"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { PeriodStudentsPdfDocument } from "@/lib/export/pdf/period-students-document";
import type { PeriodStudentExportRow } from "@/services/export/students-export.config";
import { useSyncExternalStore } from "react";

function useIsClient() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
}

export type PeriodStudentsPdfPreviewProps = {
    programName: string;
    periodName: string;
    generatedAt: string;
    rows: PeriodStudentExportRow[];
};

export function PeriodStudentsPdfPreview({
    programName,
    periodName,
    generatedAt,
    rows,
}: PeriodStudentsPdfPreviewProps) {
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
            <PeriodStudentsPdfDocument
                programName={programName}
                periodName={periodName}
                generatedAt={generatedAt}
                rows={rows}
            />
        </PDFViewer>
    );
}
