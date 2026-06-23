import type { ChartConfig } from "@/components/ui/chart";
import { AGE_RANGE_LABELS_PT, AGE_RANGE_VALUES, type AgeRangeValue } from "@/lib/age-range";
import { GENRE_LABELS_PT, GENRE_VALUES, type GenreValue } from "@/lib/genre";

export const GENRE_CHART_FILLS: Record<GenreValue, string> = {
    MALE: "var(--genre-male)",
    FEMALE: "var(--genre-female)",
    NON_BINARY: "var(--genre-non-binary)",
    PREFER_NOT_TO_SAY: "var(--genre-prefer-not-to-say)",
};

export const AGE_RANGE_CHART_FILLS: Record<AgeRangeValue, string> = {
    BABY: "var(--age-range-baby)",
    CHILDREN_I: "var(--age-range-children-i)",
    CHILDREN_II: "var(--age-range-children-ii)",
    TEEN: "var(--age-range-teen)",
    YOUNG: "var(--age-range-young)",
    ADULT: "var(--age-range-adult)",
    SENIOR: "var(--age-range-senior)",
};

export const PERIOD_ENROLLMENT_CHART_FILLS = {
    ENROLLED: "var(--period-enrolled)",
    WAITING: "var(--period-waiting)",
} as const;

export const PERIOD_SAD_CHART_FILLS = {
    VIEWED: "var(--period-sad-viewed)",
    NOT_VIEWED: "var(--period-sad-not-viewed)",
} as const;

export const PERIOD_TRANSFER_CHART_FILLS = {
    TRANSFERRED: "var(--period-transferred)",
    NOT_TRANSFERRED: "var(--period-not-transferred)",
} as const;

export const SHIFT_CHART_FILLS = {
    MORNING: "var(--shift-morning)",
    AFTERNOON: "var(--shift-afternoon)",
    EVENING: "var(--shift-evening)",
} as const;

export const PERIOD_CLASS_GROUP_FILL = "var(--period-class-group)";

export const genreChartConfig = {
    count: { label: "Alunos" },
    ...Object.fromEntries(
        GENRE_VALUES.map((genre) => [
            genre,
            { label: GENRE_LABELS_PT[genre], color: GENRE_CHART_FILLS[genre] },
        ]),
    ),
} satisfies ChartConfig;

export const ageRangeChartConfig = {
    count: { label: "Alunos" },
    ...Object.fromEntries(
        AGE_RANGE_VALUES.map((range) => [
            range,
            { label: AGE_RANGE_LABELS_PT[range], color: AGE_RANGE_CHART_FILLS[range] },
        ]),
    ),
} satisfies ChartConfig;

export const enrollmentStatusChartConfig = {
    count: { label: "Alunos" },
    ENROLLED: { label: "Matriculados", color: PERIOD_ENROLLMENT_CHART_FILLS.ENROLLED },
    WAITING: { label: "Em espera", color: PERIOD_ENROLLMENT_CHART_FILLS.WAITING },
} satisfies ChartConfig;

export const sadAccessChartConfig = {
    count: { label: "Alunos" },
    VIEWED: { label: "Visualizou", color: PERIOD_SAD_CHART_FILLS.VIEWED },
    NOT_VIEWED: { label: "Não visualizou", color: PERIOD_SAD_CHART_FILLS.NOT_VIEWED },
} satisfies ChartConfig;

export const transferChartConfig = {
    count: { label: "Alunos" },
    TRANSFERRED: { label: "Transferidos", color: PERIOD_TRANSFER_CHART_FILLS.TRANSFERRED },
    NOT_TRANSFERRED: { label: "Sem origem informada", color: PERIOD_TRANSFER_CHART_FILLS.NOT_TRANSFERRED },
} satisfies ChartConfig;

export const shiftChartConfig = {
    count: { label: "Alunos" },
    MORNING: { label: "Manhã", color: SHIFT_CHART_FILLS.MORNING },
    AFTERNOON: { label: "Tarde", color: SHIFT_CHART_FILLS.AFTERNOON },
    EVENING: { label: "Noite", color: SHIFT_CHART_FILLS.EVENING },
} satisfies ChartConfig;

export const classGroupChartConfig = {
    count: { label: "Alunos", color: PERIOD_CLASS_GROUP_FILL },
} satisfies ChartConfig;

export const PERIOD_ATTENDANCE_CHART_FILLS = {
    PRESENT: "var(--period-attendance-present)",
    ABSENT: "var(--period-attendance-absent)",
} as const;

export const attendanceChartConfig = {
    count: { label: "Registros" },
    PRESENT: { label: "Presentes", color: PERIOD_ATTENDANCE_CHART_FILLS.PRESENT },
    ABSENT: { label: "Faltas", color: PERIOD_ATTENDANCE_CHART_FILLS.ABSENT },
} satisfies ChartConfig;

export const PERIOD_CLASS_GROUPS_CURRENT_FILL = "var(--period-class-groups-current)";
export const PERIOD_CLASS_GROUPS_PREVIOUS_FILL = "var(--period-class-groups-previous)";

export const classGroupsComparisonChartConfig = {
    count: { label: "Turmas" },
    current: { label: "Período atual", color: PERIOD_CLASS_GROUPS_CURRENT_FILL },
    previous: { label: "Períodos anteriores", color: PERIOD_CLASS_GROUPS_PREVIOUS_FILL },
} satisfies ChartConfig;
