import { DayOfWeek } from "@/generated/prisma/enums";
import type { LessonListItem } from "@/services/lessons/lessons.service";
import { getScheduleTeacherDisplayName } from "@/lib/schedule-teacher-utils";
import getDayKeyInTimeZone, { APP_TIMEZONE } from "@/lib/get-day-key-in-time-zone";

export const dayOfWeekToJs: Record<DayOfWeek, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};

function dateFromDayKey(key: number): Date {
    const s = String(key);
    const year = s.slice(0, 4);
    const month = s.slice(4, 6);
    const day = s.slice(6, 8);
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

/** Expande um dayOfWeek em datas UTC (@db.Date) no intervalo do período, no timezone da app. */
export function expandScheduleDates(
    dayOfWeek: DayOfWeek,
    periodStart: Date,
    periodEnd: Date,
): Date[] {
    const targetJsDay = dayOfWeekToJs[dayOfWeek];
    const start = dateFromDayKey(getDayKeyInTimeZone(periodStart, APP_TIMEZONE));
    const end = dateFromDayKey(getDayKeyInTimeZone(periodEnd, APP_TIMEZONE));

    const dates: Date[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
        if (cursor.getUTCDay() === targetJsDay) {
            dates.push(new Date(cursor));
        }
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return dates;
}

export type UpcomingLesson = {
    date: string;
    dayOfWeek: string;
    scheduleId: string;
    timeSlotName: string;
    startTime: string;
    endTime: string;
    teacherName: string | null;
};

export type ScheduleWithTimeSlot = {
    id: string;
    dayOfWeek: DayOfWeek;
    timeSlotId: string;
    timeSlot: { id: string; name: string; startTime: string; endTime: string };
    teacher: { id: string; name: string; isActive?: boolean } | null;
};

export type ScheduleOption = {
    id: string;
    dayOfWeek: string;
    timeSlotId: string;
    timeSlotName: string;
    startTime: string;
    endTime: string;
    teacherId: string | null;
    teacherName: string | null;
};

export type LessonFilter = "fechadas" | "registradas" | "nao-registradas";

export type MergedLessonItem =
    | { type: "lesson"; data: LessonListItem }
    | { type: "upcoming"; data: UpcomingLesson };

export function generateUpcomingLessons(
    schedules: ScheduleWithTimeSlot[],
    periodStart: Date,
    periodEnd: Date,
    existingLessons: { date: Date; timeSlotId: string | null }[],
): UpcomingLesson[] {
    if (schedules.length === 0) return [];

    const todayKey = getDayKeyInTimeZone(new Date(), APP_TIMEZONE);
    const periodStartKey = getDayKeyInTimeZone(periodStart, APP_TIMEZONE);
    const startKey = Math.max(periodStartKey, todayKey);
    const endKey = getDayKeyInTimeZone(periodEnd, APP_TIMEZONE);

    if (startKey > endKey) return [];

    const start = dateFromDayKey(startKey);
    const end = dateFromDayKey(endKey);

    const occupiedKeys = new Set(
        existingLessons
            .filter((l) => l.timeSlotId)
            .map((l) => {
                const d = new Date(l.date).toISOString().split("T")[0];
                return `${d}_${l.timeSlotId}`;
            }),
    );

    const upcoming: UpcomingLesson[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
        const jsDay = cursor.getUTCDay();
        const dateStr = cursor.toISOString().split("T")[0];

        for (const schedule of schedules) {
            if (dayOfWeekToJs[schedule.dayOfWeek] === jsDay) {
                const key = `${dateStr}_${schedule.timeSlotId}`;
                if (!occupiedKeys.has(key)) {
                    upcoming.push({
                        date: dateStr,
                        dayOfWeek: schedule.dayOfWeek,
                        scheduleId: schedule.id,
                        timeSlotName: schedule.timeSlot.name,
                        startTime: schedule.timeSlot.startTime,
                        endTime: schedule.timeSlot.endTime,
                        teacherName: getScheduleTeacherDisplayName(schedule.teacher),
                    });
                }
            }
        }

        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return upcoming;
}

export function mergeAndSortLessons(
    lessons: LessonListItem[],
    upcoming: UpcomingLesson[],
): MergedLessonItem[] {
    const filteredUpcoming = upcoming.filter((u) =>
        !lessons.some((l) => {
            const ld = new Date(l.date).toISOString().split("T")[0];
            return ld === u.date && l.scheduleId === u.scheduleId;
        }),
    );

    const items: MergedLessonItem[] = [
        ...lessons.map((l) => ({ type: "lesson" as const, data: l })),
        ...filteredUpcoming.map((u) => ({ type: "upcoming" as const, data: u })),
    ];

    items.sort((a, b) => {
        const dateA = a.type === "lesson"
            ? new Date(a.data.date).getTime()
            : new Date(a.data.date + "T00:00:00Z").getTime();
        const dateB = b.type === "lesson"
            ? new Date(b.data.date).getTime()
            : new Date(b.data.date + "T00:00:00Z").getTime();
        return dateA - dateB;
    });

    return items;
}

function getTodayStart(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

export function isLessonClosed(lesson: LessonListItem): boolean {
    return lesson.attendanceUpdatedAt != null;
}

export function isRegisteredUpcomingLesson(lesson: LessonListItem): boolean {
    const today = getTodayStart();
    return new Date(lesson.date).getTime() >= today.getTime();
}

export function filterMergedLessons(
    items: MergedLessonItem[],
    filter?: LessonFilter,
): MergedLessonItem[] {
    if (!filter) return items;

    switch (filter) {
        case "fechadas":
            return items.filter((item) => item.type === "lesson" && isLessonClosed(item.data));
        case "registradas":
            return items.filter(
                (item) => item.type === "lesson"
                    && !isLessonClosed(item.data)
                    && isRegisteredUpcomingLesson(item.data),
            );
        case "nao-registradas":
            return items.filter((item) => item.type === "upcoming");
        default:
            return items;
    }
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
    const safePage = Math.max(1, page);
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
}

export function getTotalPages(totalItems: number, pageSize: number): number {
    return Math.max(1, Math.ceil(totalItems / pageSize));
}
