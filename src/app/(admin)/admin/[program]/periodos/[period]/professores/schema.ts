import { z } from "zod";

export const getTeacherPeriodAssignmentsSchema = z.object({
    periodId: z.string().min(1, "Período inválido"),
    teacherId: z.string().min(1, "Professor inválido"),
});

export type GetTeacherPeriodAssignmentsInput = z.infer<typeof getTeacherPeriodAssignmentsSchema>;
