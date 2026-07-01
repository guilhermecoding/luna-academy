"use client";

import { IconChevronDown, IconFileDownload, IconFileTypeCsv, IconFileTypePdf } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ExportStudentsDropdownProps = {
    exportPath: string;
    ariaLabel?: string;
    label?: string;
    className?: string;
};

export function ExportStudentsDropdown({
    exportPath,
    ariaLabel = "Exportar alunos",
    label = "Exportar",
    className,
}: ExportStudentsDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="dashed"
                    className={className ?? "w-full sm:w-auto"}
                    aria-label={ariaLabel}
                >
                    <IconFileDownload className="size-5 mr-1" />
                    {label}
                    <IconChevronDown className="size-4 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-surface-border p-1.5">
                <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer py-2"
                    onSelect={() => {
                        window.location.href = exportPath;
                    }}
                >
                    <IconFileTypeCsv className="size-4 text-muted-foreground" />
                    <span className="font-medium">CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer py-2"
                    onSelect={() => {
                        window.location.href = `${exportPath}?format=pdf`;
                    }}
                >
                    <IconFileTypePdf className="size-4 text-muted-foreground" />
                    <span className="font-medium">PDF</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
