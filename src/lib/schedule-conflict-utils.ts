import { DayOfWeek } from "@/generated/prisma/client";

export type ScheduleSlot = {
    dayOfWeek: DayOfWeek;
    timeSlotId: string;
    teacherId: string | null;
    roomId: string | null;
};

export function resolveScheduleRoomId(
    scheduleRoomId: string | null | undefined,
    courseRoomId: string | null | undefined,
): string | null {
    return scheduleRoomId ?? courseRoomId ?? null;
}

/**
 * Retorna mensagem de conflito entre dois slots no mesmo dia/horário, ou null se compatíveis.
 * Permite o mesmo professor na mesma sala (aulas conjuntas / reutilização de slot).
 */
export function getScheduleConflictMessage(
    a: ScheduleSlot,
    b: ScheduleSlot,
): string | null {
    if (a.dayOfWeek !== b.dayOfWeek || a.timeSlotId !== b.timeSlotId) {
        return null;
    }

    const sameTeacher =
        a.teacherId != null && b.teacherId != null && a.teacherId === b.teacherId;
    const sameRoom =
        a.roomId != null && b.roomId != null && a.roomId === b.roomId;

    if (sameRoom) {
        if (sameTeacher) {
            return null;
        }

        return "Esta sala já está ocupada neste dia e horário por outra disciplina.";
    }

    if (sameTeacher && a.roomId !== b.roomId) {
        return "Este professor já está alocado em outra sala neste dia e horário.";
    }

    return null;
}

export function findScheduleConflictInList(
    target: ScheduleSlot,
    others: ScheduleSlot[],
): string | null {
    for (const other of others) {
        const message = getScheduleConflictMessage(target, other);
        if (message) return message;
    }

    return null;
}
