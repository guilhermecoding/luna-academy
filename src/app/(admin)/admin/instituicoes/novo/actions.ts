"use server";

import { requireAdmin, requireAdminWrite } from "@/lib/auth-guards";
import { createCampus } from "@/services/campuses/campuses.service";
import { ZodError } from "zod";
import { createCampusSchema, type CreateCampusInput } from "./schema";
import { revalidatePath, updateTag } from "next/cache";

export async function createCampusAction(data: CreateCampusInput) {
    const authResult = await requireAdminWrite();
    if (!authResult.ok) return { success: false, error: authResult.error };

    try {
        const validatedData = createCampusSchema.parse(data);
        await createCampus(validatedData);

        updateTag("campuses:list");
        revalidatePath("/admin/instituicoes");
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                success: false,
                error: error.issues[0]?.message || "Erro de validação",
            };
        }

        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: "Erro ao criar instituição",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Instituição criada com sucesso",
    });

    return {
        success: true,
        redirectTo: `/admin/instituicoes?${params.toString()}`,
    };
}
