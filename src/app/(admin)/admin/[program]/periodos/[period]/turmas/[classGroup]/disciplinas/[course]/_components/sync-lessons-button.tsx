"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconRefresh } from "@tabler/icons-react";
import { syncCourseLessonsAction } from "../actions";

type SyncLessonsButtonProps = {
    programSlug: string;
    periodSlug: string;
    classGroupSlug: string;
    courseCode: string;
};

export function SyncLessonsButton({
    programSlug,
    periodSlug,
    classGroupSlug,
    courseCode,
}: SyncLessonsButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);

    const onSync = () => {
        setMessage(null);
        startTransition(async () => {
            const result = await syncCourseLessonsAction(
                programSlug,
                periodSlug,
                classGroupSlug,
                courseCode,
            );

            if (!result?.success) {
                setMessage(result?.error || "Erro ao sincronizar aulas");
                return;
            }

            setMessage(result.message || "Aulas sincronizadas");
            router.refresh();
        });
    };

    return (
        <div className="flex flex-col items-stretch sm:items-end gap-1">
            <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isPending}
                onClick={onSync}
            >
                {isPending ? (
                    <IconLoader2 className="size-4 animate-spin" />
                ) : (
                    <IconRefresh className="size-4" />
                )}
                {isPending ? "Sincronizando..." : "Registrar todas da grade"}
            </Button>
            {message && (
                <p className="text-xs text-muted-foreground max-w-xs text-right">{message}</p>
            )}
        </div>
    );
}
