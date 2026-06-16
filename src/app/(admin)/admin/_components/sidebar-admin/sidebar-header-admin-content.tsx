"use client";

import { ProgramSwitcher } from "@/components/program-switcher";
import { Program } from "@/generated/prisma/client";
import { useCanWrite } from "@/components/write-access-provider";

interface SidebarHeaderAdminProps {
    programs: Pick<Program, "name" | "slug">[];
}

export function SidebarHeaderAdminContent({ programs }: SidebarHeaderAdminProps) {
    const canWrite = useCanWrite();

    if (programs.length === 0) {
        return (
            <div className="flex justify-center mt-2">
                <span className="text-xs text-muted-foreground">
                    Nenhum programa encontrado
                </span>
            </div>
        );
    }

    return <ProgramSwitcher programs={programs} showCreateOption={canWrite} />;
}
