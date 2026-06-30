"use client";

import { IconChevronDown, IconFileDownload, IconFileTypeCsv, IconFileTypePdf } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExportStudentsDropdown({
    programSlug,
    periodSlug,
}: {
    programSlug: string;
    periodSlug: string;
}) {
    const exportCsvUrl = `/api/admin/${programSlug}/periodos/${periodSlug}/alunos/export`;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="dashed"
                    className="w-full sm:w-auto"
                    aria-label="Exportar alunos"
                >
                    <IconFileDownload className="size-5 mr-1" />
                    Exportar
                    <IconChevronDown className="size-4 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-surface-border p-1.5">
                <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer py-2"
                    onSelect={() => {
                        window.location.href = exportCsvUrl;
                    }}
                >
                    <IconFileTypeCsv className="size-4 text-muted-foreground" />
                    <span className="font-medium">CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer py-2"
                    onSelect={() => {
                        window.location.href = `${exportCsvUrl}?format=pdf`;
                    }}
                >
                    <IconFileTypePdf className="size-4 text-muted-foreground" />
                    <span className="font-medium">PDF</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
