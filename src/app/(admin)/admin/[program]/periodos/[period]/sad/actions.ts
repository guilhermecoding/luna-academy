"use server";

import { requireAdminWrite } from "@/lib/auth-guards";
import prisma from "@/lib/prisma";
import { updateTag } from "next/cache";
import { z } from "zod";

const toggleSADAccessSchema = z.object({
    periodId: z.string().uuid(),
    studentId: z.string().uuid(),
    action: z.enum(["MARK", "UNMARK"]),
});

export type ToggleSADAccessInput = z.infer<typeof toggleSADAccessSchema>;

export async function toggleSADAccessAction(input: ToggleSADAccessInput) {
    const authResult = await requireAdminWrite();
    if (!authResult.ok) {
        return { success: false as const, error: authResult.error };
    }

    const parsed = toggleSADAccessSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false as const, error: "Dados inválidos." };
    }

    const { periodId, studentId, action } = parsed.data;

    const studentPeriod = await prisma.studentPeriod.findUnique({
        where: {
            studentId_periodId: { studentId, periodId },
        },
        select: { accessedManually: true },
    });

    if (!studentPeriod) {
        return { success: false as const, error: "Aluno não encontrado neste período." };
    }

    if (action === "UNMARK" && !studentPeriod.accessedManually) {
        return {
            success: false as const,
            error: "Não é possível desmarcar um acesso registrado pelo portal do aluno.",
        };
    }

    await prisma.studentPeriod.update({
        where: {
            studentId_periodId: { studentId, periodId },
        },
        data:
            action === "MARK"
                ? { accessedAt: new Date(), accessedManually: true }
                : { accessedAt: null, accessedManually: false },
    });

    updateTag(`period:${periodId}:sad-access`);
    updateTag(`period:${periodId}:indicators`);

    return { success: true as const };
}
