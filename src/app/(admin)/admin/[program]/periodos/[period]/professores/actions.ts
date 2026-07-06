"use server";

import { requireAdmin } from "@/lib/auth-guards";
import { getTeacherPeriodAssignments } from "@/services/users/teachers.service";
import {
    getTeacherPeriodAssignmentsSchema,
    type GetTeacherPeriodAssignmentsInput,
} from "./schema";

export async function getTeacherPeriodAssignmentsAction(input: GetTeacherPeriodAssignmentsInput) {
    const authResult = await requireAdmin();
    if (!authResult.ok) return { success: false as const, error: authResult.error };

    try {
        const { periodId, teacherId } = getTeacherPeriodAssignmentsSchema.parse(input);
        const assignments = await getTeacherPeriodAssignments(periodId, teacherId);
        return { success: true as const, assignments };
    } catch (error) {
        console.error("Erro ao buscar vínculos do professor:", error);
        return { success: false as const, error: "Erro ao buscar vínculos do professor." };
    }
}
