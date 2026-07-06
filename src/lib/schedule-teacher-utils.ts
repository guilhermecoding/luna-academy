export type ScheduleTeacherRole = "TITULAR" | "ASSISTENTE";

export type ScheduleTeacherEntry = {
    teacherId: string;
    role: ScheduleTeacherRole;
};

type TeacherWithAccess = {
    id: string;
    name: string;
    isActive?: boolean;
};

export function isTeacherSystemAccessEnabled(
    teacher?: { isActive?: boolean } | null,
): boolean {
    return !!teacher && teacher.isActive !== false;
}

export function getScheduleTeacherDisplayName(
    teacher?: { name: string; isActive?: boolean } | null,
): string | null {
    if (!isTeacherSystemAccessEnabled(teacher)) return null;
    return teacher!.name;
}

export type ScheduleWithTeachers = {
    id: string;
    teacherId: string | null;
    assistants?: { assistantId: string }[];
};

export type CourseWithSchedules = {
    schedules: ScheduleWithTeachers[];
};

export function isTeacherAssignedToSchedule(
    schedule: ScheduleWithTeachers,
    teacherId: string,
): boolean {
    if (schedule.teacherId === teacherId) return true;
    return schedule.assistants?.some((a) => a.assistantId === teacherId) ?? false;
}

export function isTeacherAssignedToCourse(
    course: CourseWithSchedules,
    teacherId: string,
): boolean {
    return course.schedules.some((s) => isTeacherAssignedToSchedule(s, teacherId));
}

export function filterSchedulesForTeacher<T extends ScheduleWithTeachers>(
    schedules: T[],
    teacherId: string,
): T[] {
    return schedules.filter((s) => isTeacherAssignedToSchedule(s, teacherId));
}

export function splitScheduleTeachers(teachers: ScheduleTeacherEntry[]): {
    titularId: string | null;
    assistantIds: string[];
} {
    const titular = teachers.find((t) => t.role === "TITULAR");
    const assistantIds = teachers
        .filter((t) => t.role === "ASSISTENTE")
        .map((t) => t.teacherId);

    return {
        titularId: titular?.teacherId ?? null,
        assistantIds,
    };
}

export function scheduleToTeacherEntries(schedule: {
    teacherId: string | null;
    teacher?: { id: string; name: string } | null;
    assistants?: { assistantId: string; assistant?: { id: string; name: string } }[];
}): ScheduleTeacherEntry[] {
    const entries: ScheduleTeacherEntry[] = [];

    if (schedule.teacherId) {
        entries.push({ teacherId: schedule.teacherId, role: "TITULAR" });
    }

    for (const a of schedule.assistants ?? []) {
        entries.push({ teacherId: a.assistantId, role: "ASSISTENTE" });
    }

    return entries;
}

export function formatScheduleTeachersLabel(
    teachers: ScheduleTeacherEntry[],
    teacherNames: Map<string, string>,
): string {
    if (teachers.length === 0) return "Não atribuído";

    const titular = teachers.find((t) => t.role === "TITULAR");
    const assistants = teachers.filter((t) => t.role === "ASSISTENTE");

    if (!titular) {
        if (assistants.length === 1) {
            return teacherNames.get(assistants[0].teacherId) ?? "1 assistente";
        }
        return `${assistants.length} assistentes`;
    }

    const titularName = teacherNames.get(titular.teacherId) ?? "Titular";

    if (assistants.length === 0) {
        return `${titularName} (Titular)`;
    }

    return `${titularName} + ${assistants.length}`;
}

export function formatCourseTeachersSummary(
    schedules: {
        teacherId: string | null;
        teacher?: TeacherWithAccess | null;
        assistants?: { assistantId: string; assistant?: TeacherWithAccess | null }[];
    }[],
): string {
    const parts: string[] = [];
    const seen = new Set<string>();

    for (const schedule of schedules) {
        if (
            schedule.teacherId &&
            isTeacherSystemAccessEnabled(schedule.teacher) &&
            !seen.has(schedule.teacherId)
        ) {
            seen.add(schedule.teacherId);
            parts.push(`${schedule.teacher!.name} (Titular)`);
        }
        for (const a of schedule.assistants ?? []) {
            if (!seen.has(a.assistantId) && isTeacherSystemAccessEnabled(a.assistant)) {
                seen.add(a.assistantId);
                parts.push(`${a.assistant!.name} (Assistente)`);
            }
        }
    }

    if (parts.length === 0) return "Não atribuído";
    if (parts.length <= 2) return parts.join(", ");
    return `${parts[0]}, ${parts[1]} +${parts.length - 2}`;
}

export type CourseTeachersAggregate = {
    titulares: { id: string; name: string }[];
    assistants: { id: string; name: string }[];
};

export function aggregateCourseTeachers(
    schedules: {
        teacherId: string | null;
        teacher?: TeacherWithAccess | null;
        assistants?: { assistantId: string; assistant?: TeacherWithAccess | null }[];
    }[],
): CourseTeachersAggregate {
    const titulares = new Map<string, string>();
    const assistants = new Map<string, string>();

    for (const schedule of schedules) {
        if (
            schedule.teacherId &&
            isTeacherSystemAccessEnabled(schedule.teacher) &&
            !titulares.has(schedule.teacherId)
        ) {
            titulares.set(schedule.teacherId, schedule.teacher!.name);
        }

        for (const a of schedule.assistants ?? []) {
            if (!assistants.has(a.assistantId) && isTeacherSystemAccessEnabled(a.assistant)) {
                assistants.set(a.assistantId, a.assistant!.name);
            }
        }
    }

    const titularIds = new Set(titulares.keys());
    const assistantList = Array.from(assistants.entries())
        .filter(([id]) => !titularIds.has(id))
        .map(([id, name]) => ({ id, name }));

    return {
        titulares: Array.from(titulares.entries()).map(([id, name]) => ({ id, name })),
        assistants: assistantList,
    };
}

export function getCourseTeachersModalTitle(totalTeachers: number): string {
    return totalTeachers === 1
        ? "Professor desta disciplina"
        : "Professores desta disciplina";
}

/** Prisma filter: schedules where user is titular or assistant */
export function scheduleTeacherFilter(teacherId: string) {
    return {
        OR: [
            { teacherId },
            { assistants: { some: { assistantId: teacherId } } },
        ],
    };
}
