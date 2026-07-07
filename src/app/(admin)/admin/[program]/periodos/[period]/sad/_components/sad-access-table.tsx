"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { toggleSADAccessAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    IconCheck,
    IconCircleDottedLetterM,
    IconClock,
    IconEyeCheck,
    IconEyeMinus,
    IconLoader2,
    IconSearch,
    IconX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import AvatarUsers from "@/components/avatar-users";
import { useCanWrite } from "@/components/write-access-provider";
import { maskCPF } from "@/lib/masks";
import { calculateAge } from "@/lib/date-utils";
import { toast } from "sonner";

interface StudentData {
    id: string;
    name: string;
    cpf: string;
    email: string;
    genre: string;
    birthDate: Date;
}

export interface SADAccessItem {
    id: string;
    studentId: string;
    periodId: string;
    accessedAt: Date | null;
    accessedManually: boolean;
    student: StudentData;
}

interface SADAccessTableProps {
    data: SADAccessItem[];
    periodId: string;
    currentFilter?: "VIEWED" | "NOT_VIEWED";
}

type PendingToggle = {
    studentId: string;
    studentName: string;
    action: "MARK" | "UNMARK";
};

const formatAccessTime = (date: Date) => {
    const accessedAt = new Date(date);
    const dateStr = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(accessedAt);
    const timeStr = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(accessedAt);

    return `Visto em ${dateStr} às ${timeStr}`;
};

export function SADAccessTable({ data, periodId, currentFilter }: SADAccessTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const canWrite = useCanWrite();
    const [, startTransition] = useTransition();
    const [searchInput, setSearchInput] = useState("");
    const [globalFilter, setGlobalFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState<string | undefined>(currentFilter);
    const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const statusFilteredData = useMemo(() => {
        if (!activeFilter) return data;
        return data.filter((item) => {
            if (activeFilter === "VIEWED") return item.accessedAt !== null;
            if (activeFilter === "NOT_VIEWED") return item.accessedAt === null;
            return true;
        });
    }, [data, activeFilter]);

    const openToggleDialog = useCallback((item: SADAccessItem) => {
        if (!canWrite) return;

        if (item.accessedAt === null) {
            setPendingToggle({
                studentId: item.studentId,
                studentName: item.student.name,
                action: "MARK",
            });
            return;
        }

        if (!item.accessedManually) return;

        setPendingToggle({
            studentId: item.studentId,
            studentName: item.student.name,
            action: "UNMARK",
        });
    }, [canWrite]);

    const columns = useMemo<ColumnDef<SADAccessItem>[]>(() => [
        {
            id: "avatar",
            cell: ({ row }) => (
                <AvatarUsers
                    genre={row.original.student.genre as "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY"}
                    age={calculateAge(row.original.student.birthDate)}
                    className="size-9"
                />
            ),
        },
        {
            id: "name",
            accessorFn: (row) => row.student.name,
            header: "Aluno",
            cell: ({ row }) => (
                <div>
                    <p className="font-bold text-sm">{row.original.student.name}</p>
                </div>
            ),
        },
        {
            id: "cpf",
            accessorFn: (row) => row.student.cpf,
            header: "CPF",
            cell: ({ row }) => (
                <span className="text-sm font-mono text-muted-foreground">
                    {maskCPF(row.original.student.cpf)}
                </span>
            ),
        },
        {
            id: "email",
            accessorFn: (row) => row.student.email,
            header: "E-mail",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.student.email}
                </span>
            ),
        },
        {
            id: "status",
            header: () => <div className="text-right">Status de Acesso</div>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    {row.original.accessedAt ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none font-medium px-3 py-1">
                            {row.original.accessedManually ? (
                                <IconCircleDottedLetterM className="size-3 mr-1.5" />
                            ) : (
                                <IconCheck className="size-3 mr-1.5" />
                            )}
                            {formatAccessTime(row.original.accessedAt)}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-muted-foreground font-normal border-dashed px-3 py-1">
                            <IconClock className="size-3 mr-1.5 opacity-50" />
                            Ainda não visto
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-right">Ação</div>,
            cell: ({ row }) => {
                const item = row.original;
                const isViewed = item.accessedAt !== null;
                const canUnmark = isViewed && item.accessedManually;
                const isDisabled = !canWrite || (isViewed && !canUnmark);

                return (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => openToggleDialog(item)}
                            disabled={isDisabled}
                            aria-label={
                                isViewed
                                    ? canUnmark
                                        ? "Retirar visualização"
                                        : "Visualização registrada pelo portal"
                                    : "Marcar como visualizado"
                            }
                            className={`
                                inline-flex items-center justify-center rounded-full p-3 text-xs font-semibold
                                transition-all duration-150 select-none
                                ${isDisabled ? "cursor-default opacity-50" : "cursor-pointer"}
                                ${isViewed
                                    ? "bg-emerald-300 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }
                            `}
                        >
                            {isViewed ? (
                                <IconEyeMinus className="size-3.5" />
                            ) : (
                                <IconEyeCheck className="size-3.5" />
                            )}
                        </button>
                    </div>
                );
            },
        },
    ], [canWrite, openToggleDialog]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setGlobalFilter(searchInput);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchInput]);

     
    const table = useReactTable({
        data: statusFilteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _columnId, filterValue: string) => {
            const term = filterValue.trim().toLowerCase();
            if (!term) return true;
            const cleanedTerm = term.replace(/\D/g, "");
            const student = row.original.student;
            return (
                student.name.toLowerCase().includes(term) ||
                student.email.toLowerCase().includes(term) ||
                (cleanedTerm.length > 0 && student.cpf.includes(cleanedTerm))
            );
        },
        initialState: {
            pagination: { pageSize: 10 },
        },
    });

    const handleFilter = (filter?: string) => {
        setActiveFilter(filter);

        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (filter) {
                params.set("filter", filter);
            } else {
                params.delete("filter");
            }
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    const handleConfirmToggle = async () => {
        if (!pendingToggle) return;

        setIsSubmitting(true);
        try {
            const result = await toggleSADAccessAction({
                periodId,
                studentId: pendingToggle.studentId,
                action: pendingToggle.action,
            });

            if (!result.success) {
                toast.error(result.error);
                return;
            }

            toast.success(
                pendingToggle.action === "MARK"
                    ? "Visualização registrada com sucesso."
                    : "Visualização removida com sucesso.",
            );
            setPendingToggle(null);
            router.refresh();
        } catch {
            toast.error("Erro inesperado ao atualizar a visualização.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-3xl border border-surface-border overflow-hidden bg-background">
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between px-4 py-3 border-b border-surface-border bg-surface">
                    <div className="w-full sm:max-w-xs flex flex-row items-center gap-2 px-4 py-1 rounded-full border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                        <IconSearch className="size-4 shrink-0 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="border-none bg-transparent shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-full border border-surface-border self-start sm:self-auto">
                        <Button
                            variant={!activeFilter ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleFilter()}
                            className="rounded-full text-xs px-2 py-4"
                        >
                            Todos
                        </Button>
                        <Button
                            variant={activeFilter === "VIEWED" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleFilter("VIEWED")}
                            className="rounded-full text-xs px-2 py-4"
                        >
                            <IconCheck className="size-3 mr-1" />
                            Vistos
                        </Button>
                        <Button
                            variant={activeFilter === "NOT_VIEWED" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleFilter("NOT_VIEWED")}
                            className="rounded-full text-xs px-2 py-4"
                        >
                            <IconX className="size-3 mr-1" />
                            Não vistos
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader className="bg-surface">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-surface-border">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-semibold text-muted-foreground">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="border-surface-border hover:bg-muted/20 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    Nenhum aluno encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    Exibindo {table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length} alunos.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex w-25 items-center justify-center text-sm font-medium text-muted-foreground">
                        Página {table.getState().pagination.pageIndex + 1} de{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="text-lg">«</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="text-lg">‹</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="text-lg">›</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="text-lg">»</span>
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={pendingToggle !== null} onOpenChange={(open) => !open && !isSubmitting && setPendingToggle(null)}>
                <DialogContent className="sm:max-w-md border-none bg-surface p-8 rounded-3xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary-theme opacity-20" />

                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="relative size-32 animate-bounce-slow">
                            <Image
                                src="/gibby-normal-icon.svg"
                                alt="Gibby"
                                fill
                                className="object-contain"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-center">
                                    {pendingToggle?.action === "MARK"
                                        ? "Marcar como visualizado?"
                                        : "Retirar visualização?"}
                                </DialogTitle>
                            </DialogHeader>
                            <DialogDescription className="text-muted-foreground text-base">
                                {pendingToggle?.action === "MARK" ? (
                                    <>
                                        Ao confirmar, o sistema contabilizará que{" "}
                                        <strong>{pendingToggle.studentName}</strong> visualizou o resultado.
                                    </>
                                ) : (
                                    <>
                                        Ao confirmar, o sistema deixará de contabilizar que{" "}
                                        <strong>{pendingToggle?.studentName}</strong> visualizou o resultado.
                                    </>
                                )}
                            </DialogDescription>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-row gap-3 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setPendingToggle(null)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            className="flex-1"
                            onClick={() => void handleConfirmToggle()}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <IconLoader2 className="size-4 animate-spin mr-2" />}
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
