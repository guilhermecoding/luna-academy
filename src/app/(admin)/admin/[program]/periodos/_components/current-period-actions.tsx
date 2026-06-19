"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { IconFileTextFilled, IconPencilFilled } from "@tabler/icons-react";
import { useCanWrite } from "@/components/write-access-provider";

export function CurrentPeriodActions({
    programSlug,
    periodSlug,
}: {
    programSlug: string;
    periodSlug: string;
}) {
    const canWrite = useCanWrite();

    return (
        <div className="flex flex-col-reverse sm:flex-row justify-end items-center mt-6 gap-4">
            {canWrite && (
                <ButtonLink
                    href={`/admin/${programSlug}/periodos/${periodSlug}/editar`}
                    variant="outline"
                    className="bg-transparent text-muted-foreground w-full sm:w-auto"
                >
                    <IconPencilFilled className="size-5" />
                    Editar
                </ButtonLink>
            )}
            <ButtonLink
                href={`/admin/${programSlug}/periodos/${periodSlug}`}
                className="w-full sm:w-auto"
            >
                <IconFileTextFilled className="size-5" />
                Detalhar
            </ButtonLink>
        </div>
    );
}
