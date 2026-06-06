/**
 * Gera uma chave numerica no formato YYYYMMDD para uma data em um timezone especifico.
 *
 * Essa funcao e util quando a regra de negocio precisa comparar apenas o dia
 * (ignorando hora/minuto/segundo), evitando efeitos de fuso horario.
 *
 * Como usar:
 * - Compare duas datas por dia no mesmo timezone.
 * - Use a chave retornada com operadores numericos (<, >, ===).
 *
 * Exemplo:
 * const todayKey = getDayKeyInTimeZone(new Date(), "America/Sao_Paulo");
 * const endKey = getDayKeyInTimeZone(period.endDate, "America/Sao_Paulo");
 * const isLate = todayKey > endKey;
 *
 * @param date Data de referencia.
 * @param timeZone Timezone IANA (ex.: "America/Sao_Paulo", "UTC").
 * @returns Chave numerica YYYYMMDD.
 */
export const DEFAULT_APP_TIMEZONE = "America/Sao_Paulo";

function normalizeTimeZoneCandidate(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }

    return trimmed.startsWith(":") ? trimmed.slice(1) : trimmed;
}

function isValidTimeZone(timeZone: string): boolean {
    try {
        Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
        return true;
    } catch {
        return false;
    }
}

function resolveAppTimezone(): string {
    const candidates = [
        normalizeTimeZoneCandidate(process.env.NEXT_PUBLIC_APP_TIMEZONE),
        normalizeTimeZoneCandidate(process.env.TZ),
        normalizeTimeZoneCandidate(Intl.DateTimeFormat().resolvedOptions().timeZone),
    ].filter((timeZone): timeZone is string => Boolean(timeZone));

    for (const timeZone of candidates) {
        if (isValidTimeZone(timeZone)) {
            return timeZone;
        }

        console.warn(`[timezone] Valor inválido ignorado: "${timeZone}".`);
    }

    console.warn(
        `[timezone] Nenhum timezone válido encontrado. Usando fallback: "${DEFAULT_APP_TIMEZONE}".`,
    );

    return DEFAULT_APP_TIMEZONE;
}

export const APP_TIMEZONE = resolveAppTimezone();

export default function getDayKeyInTimeZone(date: Date, timeZone: string = APP_TIMEZONE): number {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    let year = "";
    let month = "";
    let day = "";

    for (const part of parts) {
        if (part.type === "year") {
            year = part.value;
        }

        if (part.type === "month") {
            month = part.value;
        }

        if (part.type === "day") {
            day = part.value;
        }
    }

    return Number(`${year}${month}${day}`);
}
