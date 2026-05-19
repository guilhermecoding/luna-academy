"use server";

import { updateUser } from "@/services/users/users.service";
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { editProfileSchema, type EditProfileInput } from "./schema";
import { unmask } from "@/lib/masks";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";

export async function editProfileAction(data: EditProfileInput) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const memberId = session?.user?.id;

        if (!memberId || !session.user.isTeacher) {
            return { success: false, error: "Não autorizado." };
        }

        const validatedData = editProfileSchema.parse(data);
        const cleanData = {
            ...validatedData,
            cpf: unmask(validatedData.cpf),
            phone: unmask(validatedData.phone),
        };

        const { password, confirmPassword, ...updateFields } = cleanData;
        void confirmPassword;

        // Atualiza apenas os dados pessoais do professor de forma protegida
        const { affectedGroups } = await updateUser(memberId, updateFields);

        // Invalida cache de todos os períodos e turmas onde o professor tinha aulas
        const affectedPeriodIds = new Set<string>();
        for (const group of affectedGroups) {
            updateTag(`period:${group.periodId}:class-group:${group.slug}`);
            affectedPeriodIds.add(group.periodId);
        }

        for (const periodId of affectedPeriodIds) {
            updateTag(`period:${periodId}:class-groups`);
            updateTag(`period:${periodId}:courses`);
        }

        if (password) {
            try {
                await auth.api.setUserPassword({
                    body: {
                        userId: memberId,
                        newPassword: password,
                    },
                    headers: await headers(),
                });
            } catch (passwordError) {
                const normalizedMessage = passwordError instanceof Error ? passwordError.message : String(passwordError);
                const deniedByAdminPlugin = normalizedMessage.includes("not allowed to set users password");

                if (!deniedByAdminPlugin) {
                    throw passwordError;
                }

                const passwordHash = await hashPassword(password);
                await prisma.account.updateMany({
                    where: {
                        userId: memberId,
                        providerId: "credential",
                    },
                    data: {
                        password: passwordHash,
                    },
                });
            }
        }

        updateTag("users-list");
        updateTag("users-stats");
        updateTag("all-teachers");
        updateTag(`user-${memberId}`);
        revalidatePath("/prof", "layout");
        revalidatePath("/prof/perfil");

        return { 
            success: true as const, 
            redirectTo: `/prof/perfil?toast=success&message=${encodeURIComponent("Perfil atualizado com sucesso!")}`, 
        };
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                success: false,
                error: error.issues[0]?.message || "Erro de validação",
            };
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const target = (error.meta?.target as string[]) || [];
                if (target.includes("cpf")) return { success: false, error: "Já existe um usuário com este CPF." };
                if (target.includes("email")) return { success: false, error: "Já existe um usuário com este e-mail." };
            }
        }

        if (error instanceof Error) {
            if (error.message === "CPF_ALREADY_EXISTS") {
                return { success: false, error: "Já existe um usuário cadastrado com este CPF." };
            }
            if (error.message.includes("User already exists") || (error.message.includes("Unique constraint failed") && error.message.includes("email"))) {
                return { success: false, error: "Já existe um usuário com este e-mail." };
            }
            if (error.message.includes("Unique constraint failed") && error.message.includes("cpf")) {
                return { success: false, error: "Já existe um usuário com este CPF." };
            }
            const normalizedMessage = error.message
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .join(" | ");

            return {
                success: false,
                error: "Erro do banco de dados: " + (normalizedMessage || error.message || "Falha desconhecida"),
            };
        }

        return {
            success: false,
            error: "Erro ao atualizar perfil",
        };
    }
}
