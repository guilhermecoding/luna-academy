import getDayKeyInTimeZone, { APP_TIMEZONE } from "@/lib/get-day-key-in-time-zone";

export function formatTime(date: Date, timeZone: string = APP_TIMEZONE) {
    return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
    }).format(date);
}

export function formatDateShortNumeric(date: Date, timeZone: string = APP_TIMEZONE) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone,
    }).format(date);
}

export function formatAttendanceUpdatedLabel(date: Date, now: Date = new Date()): string {
    const timeZone = APP_TIMEZONE;
    const dateKey = getDayKeyInTimeZone(date, timeZone);
    const todayKey = getDayKeyInTimeZone(now, timeZone);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayKey = getDayKeyInTimeZone(yesterday, timeZone);

    const timeStr = formatTime(date, timeZone);

    if (dateKey === todayKey) {
        return `CHAMADA REALIZADA HOJE ÀS ${timeStr}`;
    }

    if (dateKey === yesterdayKey) {
        return `CHAMADA REALIZADA ONTEM ÀS ${timeStr}`;
    }

    return `CHAMADA REALIZADA EM ${formatDateShortNumeric(date, timeZone)} ÀS ${timeStr}`;
}

export default function formatDate(date: Date) {
    const timeZone = "UTC";
    const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone }).format(date);
    const month = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone })
        .format(date)
        .replace(".", "")
        .replace(/^./, (char) => char.toUpperCase());
    const year = new Intl.DateTimeFormat("pt-BR", { year: "numeric", timeZone }).format(date);

    return `${day} ${month}, ${year}`;
}

export function formatDateShort(date: Date) {
    const timeZone = "UTC";
    const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone }).format(date);
    const month = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone })
        .format(date)
        .replace(".", "")
        .replace(/^./, (char) => char.toUpperCase());

    return `${day} ${month}`;
}
