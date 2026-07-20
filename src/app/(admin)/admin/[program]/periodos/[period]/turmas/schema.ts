import { z } from "zod";

export const SHIFTS = ["MORNING", "AFTERNOON", "EVENING"] as const;

export const shiftLabels: Record<(typeof SHIFTS)[number], string> = {
    MORNING: "Manhã",
    AFTERNOON: "Tarde",
    EVENING: "Noite",
};

export const DAYS_OF_WEEK = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
] as const;

export const dayOfWeekLabels: Record<(typeof DAYS_OF_WEEK)[number], string> = {
    MONDAY: "Segunda",
    TUESDAY: "Terça",
    WEDNESDAY: "Quarta",
    THURSDAY: "Quinta",
    FRIDAY: "Sexta",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
};

export const dayOfWeekShortLabels: Record<(typeof DAYS_OF_WEEK)[number], string> = {
    MONDAY: "Seg",
    TUESDAY: "Ter",
    WEDNESDAY: "Qua",
    THURSDAY: "Qui",
    FRIDAY: "Sex",
    SATURDAY: "Sáb",
    SUNDAY: "Dom",
};

export const scheduleTeacherSchema = z.object({
    teacherId: z.string().min(1, "Professor inválido"),
    role: z.enum(["TITULAR", "ASSISTENTE"]),
});

export type ScheduleTeacherInput = z.infer<typeof scheduleTeacherSchema>;

export const scheduleEntrySchema = z.object({
    dayOfWeek: z.enum(DAYS_OF_WEEK, {
        message: "Selecione o dia da semana",
    }),
    timeSlotId: z.string().min(1, "Selecione o horário"),
    roomId: z.string().optional().or(z.literal("")),
    teachers: z.array(scheduleTeacherSchema).default([]),
}).superRefine((data, ctx) => {
    const ids = data.teachers.map((t) => t.teacherId);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
        ctx.addIssue({
            code: "custom",
            message: "Não é possível adicionar o mesmo professor mais de uma vez no slot.",
            path: ["teachers"],
        });
    }

    const titularCount = data.teachers.filter((t) => t.role === "TITULAR").length;
    if (data.teachers.length > 0 && titularCount !== 1) {
        ctx.addIssue({
            code: "custom",
            message: "Selecione exatamente um professor titular quando houver professores no slot.",
            path: ["teachers"],
        });
    }
});

export const courseSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    code: z.string()
        .min(2, "O código deve ter no mínimo 2 caracteres")
        .regex(/^[a-zA-Z0-9-]+$/, "O código deve conter apenas letras, números e hífens"),
    subjectId: z.string().min(1, "Selecione uma disciplina"),
    roomId: z.string().optional().or(z.literal("")),
    shift: z.enum(SHIFTS, {
        message: "Selecione um turno",
    }),
    classGroupId: z.string().optional().or(z.literal("")),
    schedules: z.array(scheduleEntrySchema).default([]),
});

export type ScheduleEntryInput = z.infer<typeof scheduleEntrySchema>;
export type CourseInput = z.output<typeof courseSchema>;

/** Atualização de turma disciplinar: código vem do banco, não do cliente. */
export const courseUpdateSchema = courseSchema.omit({ code: true });
export type CourseUpdateInput = z.output<typeof courseUpdateSchema>;

export const classGroupSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    slug: z.string()
        .min(2, "O código deve ter no mínimo 2 caracteres")
        .regex(/^[a-zA-Z0-9-]+$/, "O código deve conter apenas letras, números e hífens"),
    degreeId: z.string().min(1, "Selecione uma matriz curricular"),
    shift: z.enum(SHIFTS, {
        message: "Selecione um turno",
    }),
    groupLink: z.string().url("Link inválido").optional().or(z.literal("")),
    subjectIds: z.array(z.string().uuid()).min(1, "Selecione ao menos uma disciplina"),
});

export const classGroupEditSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    shift: z.enum(SHIFTS, {
        message: "Selecione um turno",
    }),
    groupLink: z.string().url("Link inválido").optional().or(z.literal("")),
});

export type ClassGroupInput = z.output<typeof classGroupSchema>;
export type ClassGroupEditInput = z.output<typeof classGroupEditSchema>;

