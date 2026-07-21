"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    IconSearch,
    IconLoader2,
    IconUserCheck,
    IconAlertCircle,
    IconUserPlus,
} from "@tabler/icons-react";
import {
    findStudentsForPeriodAssociationAction,
    associateStudentsToPeriodAction,
} from "../../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FoundStudent = {
    id: string;
    name: string;
    lunaId: string;
};

export default function AssociateStudentsTab({
    periodId,
    redirectPath = "/admin/alunos",
}: {
    periodId: string;
    redirectPath?: string;
}) {
    const router = useRouter();
    const [bulkInput, setBulkInput] = useState("");
    const [foundStudents, setFoundStudents] = useState<FoundStudent[]>([]);
    const [notFound, setNotFound] = useState<string[]>([]);
    const [isValidating, setIsValidating] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleValidate = async () => {
        if (!bulkInput.trim()) return;

        setIsValidating(true);
        const identifiers = bulkInput
            .split(/[\n,;]+/)
            .map((i) => i.trim().replace(/[.-]/g, ""))
            .filter((i) => i.length > 0);

        const res = await findStudentsForPeriodAssociationAction(identifiers);

        if (res.success && res.students) {
            setFoundStudents(
                res.students.map((s) => ({
                    id: s.id,
                    name: s.name,
                    lunaId: s.lunaId || "",
                })),
            );
            setNotFound(res.notFound || []);
            if (res.students.length === 0 && (res.notFound?.length ?? 0) === 0) {
                toast.info("Nenhum aluno correspondente encontrado.");
            }
        } else {
            toast.error(res.error || "Erro ao validar lista.");
        }
        setIsValidating(false);
    };

    const handleAssociate = () => {
        if (foundStudents.length === 0) return;

        startTransition(async () => {
            const res = await associateStudentsToPeriodAction(
                foundStudents.map((s) => s.id),
                periodId,
            );

            if (res.success) {
                toast.success(
                    `${foundStudents.length} aluno(s) associado(s) ao período com sucesso!`,
                );
                if (redirectPath === "none") {
                    setBulkInput("");
                    setFoundStudents([]);
                    setNotFound([]);
                    router.refresh();
                } else {
                    router.push(redirectPath || "/admin/alunos");
                    router.refresh();
                }
            } else {
                toast.error(res.error || "Erro ao associar alunos.");
            }
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-bold text-foreground">Associação em Massa</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Associa alunos já cadastrados no sistema a este período através do CPF ou
                    Matrícula.
                </p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">Cole a lista abaixo</p>
                    <Badge
                        variant="outline"
                        className="text-[10px] uppercase tracking-wider opacity-60"
                    >
                        Matrículas ou CPFs
                    </Badge>
                </div>
                <Textarea
                    placeholder={
                        "Ex: 2024001, 2024002, 123.456.789-00\nPode separar por vírgula ou nova linha.\nAlunos já vinculados ao período serão ignorados."
                    }
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    className="min-h-37.5 max-h-48 field-sizing-fixed overflow-y-auto rounded-2xl bg-background border-surface-border resize-none focus:ring-primary/20"
                />
                <div className="flex justify-center items-center">
                    <Button
                        type="button"
                        className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid"
                        variant="secondary"
                        onClick={handleValidate}
                        disabled={!bulkInput.trim() || isValidating}
                    >
                        {isValidating ? (
                            <IconLoader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                            <IconSearch className="size-4 mr-2" />
                        )}
                        {isValidating ? "Validando..." : "Validar Lista"}
                    </Button>
                </div>
            </div>

            {(foundStudents.length > 0 || notFound.length > 0) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between border-b border-surface-border pb-2">
                        <p className="text-sm font-bold">Resultados da Validação</p>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none">
                            {foundStudents.length} encontrados
                        </Badge>
                    </div>

                    {foundStudents.length > 0 && (
                        <div className="border border-emerald-500/10 rounded-xl overflow-hidden bg-emerald-500/5">
                            <div className="max-h-60 overflow-y-auto divide-y divide-emerald-500/10">
                                {foundStudents.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center gap-3 p-3"
                                    >
                                        <IconUserCheck className="size-4 text-emerald-600 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">
                                                {student.name}
                                            </p>
                                            <p className="text-[10px] text-emerald-600/70 font-mono">
                                                {student.lunaId || "—"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {notFound.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-amber-600 px-1">
                                <IconAlertCircle className="size-4" />
                                <p className="text-xs font-bold uppercase tracking-tight">
                                    Não encontrados ({notFound.length})
                                </p>
                            </div>
                            <div className="max-h-40 overflow-y-auto flex flex-wrap gap-1.5 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                                {notFound.map((id, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className="bg-background border-amber-200 text-amber-700 font-mono text-[10px]"
                                    >
                                        {id}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {foundStudents.length > 0 && (
                <div className="flex justify-end pt-2 border-t border-surface-border">
                    <Button
                        type="button"
                        disabled={isPending}
                        onClick={handleAssociate}
                        className="h-11"
                    >
                        {isPending ? (
                            <IconLoader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                            <IconUserPlus className="size-4 mr-2" />
                        )}
                        Associar {foundStudents.length} aluno(s)
                    </Button>
                </div>
            )}
        </div>
    );
}
