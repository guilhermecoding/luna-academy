import { Shift } from "@/generated/prisma/enums";
import { type AgeRangeValue } from "@/lib/age-range";
import { type GenreValue } from "@/lib/genre";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

const PERIOD_SHIFTS = [Shift.MORNING, Shift.AFTERNOON, Shift.EVENING] as const;

function computeTrend(current: number, previous: number | null): {
    delta: number | null;
    percentageChange: number | null;
} {
    if (previous === null) {
        return { delta: null, percentageChange: null };
    }

    const delta = current - previous;
    const percentageChange = previous > 0
        ? Math.round((Math.abs(delta) / previous) * 100)
        : (current > 0 ? 100 : 0);

    return { delta, percentageChange };
}

export type PeriodOperationalStats = {
    total: number;
    waiting: number;
    enrolled: number;
    enrollmentRate: number;
    totalDelta: number | null;
    totalPercentageChange: number | null;
    enrolledDelta: number | null;
    enrolledPercentageChange: number | null;
    waitingDelta: number | null;
    waitingPercentageChange: number | null;
    enrollmentRateDelta: number | null;
    enrollmentRateBadgeValue: number | null;
};

export type PeriodStructureStats = {
    classGroupsCount: number;
    avgStudentsPerClass: number;
};

export type PeriodSADAccessStats = {
    total: number;
    viewed: number;
    percentage: number;
};

export type PeriodStudentProfileStats = {
    averageAge: number | null;
    transferredCount: number;
};

export type PeriodStudentDemographics = {
    gender: Record<GenreValue, number>;
    ageRange: Record<AgeRangeValue, number>;
};

export type PeriodProportionStats = {
    enrolled: number;
    waiting: number;
    sadViewed: number;
    sadNotViewed: number;
    transferred: number;
    notTransferred: number;
};

export type PeriodStructureDistribution = {
    byShift: { shift: Shift; count: number }[];
    byClassGroup: { name: string; count: number }[];
};

/**
 * Estatísticas operacionais do período (total, matriculados, em espera, taxa de enturmação)
 * com comparação ao período anterior do mesmo programa — uma única query no banco.
 */
export async function getPeriodOperationalStats(periodId: string): Promise<PeriodOperationalStats> {
    "use cache";
    cacheLife("days");
    cacheTag(`period:${periodId}:indicators`);

    const [row] = await prisma.$queryRaw<{
        total: number;
        waiting: number;
        enrolled: number;
        enrollment_rate: number;
        previous_total: number | null;
        previous_waiting: number | null;
        previous_enrolled: number | null;
        previous_enrollment_rate: number | null;
    }[]>`
        WITH current_period AS (
            SELECT id, id_program, start_date, created_at
            FROM public.periods
            WHERE id = ${periodId}::uuid
        ),
        previous_period AS (
            SELECT p.id
            FROM public.periods p
            INNER JOIN current_period cp ON p.id_program = cp.id_program
            WHERE p.start_date < cp.start_date
               OR (p.start_date = cp.start_date AND p.created_at < cp.created_at)
            ORDER BY p.start_date DESC, p.created_at DESC
            LIMIT 1
        ),
        current_counts AS (
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE sp.status = 'WAITING')::int AS waiting,
                COUNT(*) FILTER (WHERE sp.status = 'ENROLLED')::int AS enrolled
            FROM public.student_periods sp
            INNER JOIN current_period cp ON sp.period_id = cp.id
        ),
        previous_counts AS (
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE sp.status = 'WAITING')::int AS waiting,
                COUNT(*) FILTER (WHERE sp.status = 'ENROLLED')::int AS enrolled
            FROM public.student_periods sp
            WHERE sp.period_id = (SELECT id FROM previous_period)
        )
        SELECT
            cc.total,
            cc.waiting,
            cc.enrolled,
            CASE
                WHEN cc.total > 0 THEN ROUND(cc.enrolled::numeric / cc.total * 100)::int
                ELSE 0
            END AS enrollment_rate,
            CASE
                WHEN EXISTS (SELECT 1 FROM previous_period) THEN pc.total
                ELSE NULL
            END AS previous_total,
            CASE
                WHEN EXISTS (SELECT 1 FROM previous_period) THEN pc.waiting
                ELSE NULL
            END AS previous_waiting,
            CASE
                WHEN EXISTS (SELECT 1 FROM previous_period) THEN pc.enrolled
                ELSE NULL
            END AS previous_enrolled,
            CASE
                WHEN EXISTS (SELECT 1 FROM previous_period) AND pc.total > 0
                    THEN ROUND(pc.enrolled::numeric / pc.total * 100)::int
                WHEN EXISTS (SELECT 1 FROM previous_period) THEN 0
                ELSE NULL
            END AS previous_enrollment_rate
        FROM current_counts cc
        CROSS JOIN previous_counts pc
    `;

    if (!row) {
        return {
            total: 0,
            waiting: 0,
            enrolled: 0,
            enrollmentRate: 0,
            totalDelta: null,
            totalPercentageChange: null,
            enrolledDelta: null,
            enrolledPercentageChange: null,
            waitingDelta: null,
            waitingPercentageChange: null,
            enrollmentRateDelta: null,
            enrollmentRateBadgeValue: null,
        };
    }

    const totalTrend = computeTrend(row.total, row.previous_total);
    const enrolledTrend = computeTrend(row.enrolled, row.previous_enrolled);
    const waitingTrend = computeTrend(row.waiting, row.previous_waiting);

    const enrollmentRateDelta = row.previous_enrollment_rate !== null
        ? row.enrollment_rate - row.previous_enrollment_rate
        : null;

    const enrollmentRateBadgeValue = enrollmentRateDelta !== null
        ? Math.abs(enrollmentRateDelta)
        : null;

    return {
        total: row.total,
        waiting: row.waiting,
        enrolled: row.enrolled,
        enrollmentRate: row.enrollment_rate,
        totalDelta: totalTrend.delta,
        totalPercentageChange: totalTrend.percentageChange,
        enrolledDelta: enrolledTrend.delta,
        enrolledPercentageChange: enrolledTrend.percentageChange,
        waitingDelta: waitingTrend.delta,
        waitingPercentageChange: waitingTrend.percentageChange,
        enrollmentRateDelta,
        enrollmentRateBadgeValue,
    };
}

/**
 * Estatísticas estruturais do período: total de turmas e média de alunos únicos por turma.
 */
export async function getPeriodStructureStats(periodId: string): Promise<PeriodStructureStats> {
    "use cache";
    cacheLife("days");
    cacheTag(`period:${periodId}:indicators`);

    const [row] = await prisma.$queryRaw<{
        class_groups_count: number;
        avg_students_per_class: number;
    }[]>`
        SELECT
            COUNT(DISTINCT cg.id)::int AS class_groups_count,
            COALESCE(ROUND(AVG(group_counts.student_count), 1), 0)::float AS avg_students_per_class
        FROM public.class_groups cg
        LEFT JOIN LATERAL (
            SELECT COUNT(DISTINCT e.student_id)::int AS student_count
            FROM public.courses c
            JOIN public.enrollments e ON e.course_id = c.id
            WHERE c.class_group_id = cg.id
        ) group_counts ON true
        WHERE cg.period_id = ${periodId}::uuid
    `;

    return {
        classGroupsCount: row?.class_groups_count ?? 0,
        avgStudentsPerClass: row?.avg_students_per_class ?? 0,
    };
}

/**
 * Estatísticas de acesso ao SAD — apenas alunos matriculados em turma do período.
 */
export async function getPeriodSADAccessStats(periodId: string): Promise<PeriodSADAccessStats> {
    "use cache";
    cacheLife("days");
    cacheTag(`period:${periodId}:indicators`);

    const [row] = await prisma.$queryRaw<{
        total: number;
        viewed: number;
    }[]>`
        SELECT
            COUNT(DISTINCT sp.student_id)::int AS total,
            COUNT(DISTINCT sp.student_id) FILTER (WHERE sp.accessed_at IS NOT NULL)::int AS viewed
        FROM public.student_periods sp
        WHERE sp.period_id = ${periodId}::uuid
          AND EXISTS (
              SELECT 1
              FROM public.enrollments e
              JOIN public.courses c ON c.id = e.course_id
              WHERE e.student_id = sp.student_id
                AND c.period_id = ${periodId}::uuid
                AND c.class_group_id IS NOT NULL
          )
    `;

    const total = row?.total ?? 0;
    const viewed = row?.viewed ?? 0;
    const percentage = total > 0 ? Math.round((viewed / total) * 100) : 0;

    return { total, viewed, percentage };
}

/**
 * Perfil demográfico dos alunos vinculados ao período.
 */
export async function getPeriodStudentProfileStats(periodId: string): Promise<PeriodStudentProfileStats> {
    "use cache";
    cacheLife("days");
    cacheTag(`period:${periodId}:indicators`);

    const [row] = await prisma.$queryRaw<{
        average_age: number | null;
        transferred_count: number;
    }[]>`
        SELECT
            ROUND(AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.birth_date))))::int AS average_age,
            COUNT(*) FILTER (
                WHERE s.origin_school IS NOT NULL AND s.origin_school <> ''
            )::int AS transferred_count
        FROM public.students s
        INNER JOIN public.student_periods sp ON sp.student_id = s.id
        WHERE sp.period_id = ${periodId}::uuid
    `;

    return {
        averageAge: row?.average_age ?? null,
        transferredCount: row?.transferred_count ?? 0,
    };
}

/**
 * Distribuição demográfica dos alunos vinculados ao período (gênero + faixa etária).
 */
export async function getPeriodStudentDemographics(periodId: string): Promise<PeriodStudentDemographics> {
    "use cache";
    cacheLife("days");
    cacheTag(`period:${periodId}:indicators`);

    const [row] = await prisma.$queryRaw<{
        male: number;
        female: number;
        non_binary: number;
        prefer_not_to_say: number;
        baby: number;
        children_i: number;
        children_ii: number;
        teen: number;
        young: number;
        adult: number;
        senior: number;
    }[]>`
        WITH period_students AS (
            SELECT
                s.genre,
                EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.birth_date))::int AS age
            FROM public.students s
            INNER JOIN public.student_periods sp ON sp.student_id = s.id
            WHERE sp.period_id = ${periodId}::uuid
        )
        SELECT
            COUNT(*) FILTER (WHERE genre = 'MALE')::int AS male,
            COUNT(*) FILTER (WHERE genre = 'FEMALE')::int AS female,
            COUNT(*) FILTER (WHERE genre = 'NON_BINARY')::int AS non_binary,
            COUNT(*) FILTER (WHERE genre = 'PREFER_NOT_TO_SAY')::int AS prefer_not_to_say,
            COUNT(*) FILTER (WHERE age BETWEEN 0 AND 3)::int AS baby,
            COUNT(*) FILTER (WHERE age BETWEEN 4 AND 8)::int AS children_i,
            COUNT(*) FILTER (WHERE age BETWEEN 9 AND 12)::int AS children_ii,
            COUNT(*) FILTER (WHERE age BETWEEN 13 AND 16)::int AS teen,
            COUNT(*) FILTER (WHERE age BETWEEN 17 AND 24)::int AS young,
            COUNT(*) FILTER (WHERE age BETWEEN 25 AND 60)::int AS adult,
            COUNT(*) FILTER (WHERE age >= 61)::int AS senior
        FROM period_students
    `;

    return {
        gender: {
            MALE: row?.male ?? 0,
            FEMALE: row?.female ?? 0,
            NON_BINARY: row?.non_binary ?? 0,
            PREFER_NOT_TO_SAY: row?.prefer_not_to_say ?? 0,
        },
        ageRange: {
            BABY: row?.baby ?? 0,
            CHILDREN_I: row?.children_i ?? 0,
            CHILDREN_II: row?.children_ii ?? 0,
            TEEN: row?.teen ?? 0,
            YOUNG: row?.young ?? 0,
            ADULT: row?.adult ?? 0,
            SENIOR: row?.senior ?? 0,
        },
    };
}

/**
 * Proporções de matrícula, acesso ao SAD e transferência para gráficos do período.
 */
export async function getPeriodProportionStats(periodId: string): Promise<PeriodProportionStats> {
    "use cache";
    cacheLife("days");
    cacheTag(`period:${periodId}:indicators`);

    const [row] = await prisma.$queryRaw<{
        enrolled: number;
        waiting: number;
        sad_viewed: number;
        sad_not_viewed: number;
        transferred: number;
        not_transferred: number;
    }[]>`
        WITH period_students AS (
            SELECT
                sp.student_id,
                sp.status,
                sp.accessed_at,
                s.origin_school,
                EXISTS (
                    SELECT 1
                    FROM public.enrollments e
                    JOIN public.courses c ON c.id = e.course_id
                    WHERE e.student_id = sp.student_id
                      AND c.period_id = ${periodId}::uuid
                      AND c.class_group_id IS NOT NULL
                ) AS is_class_enrolled
            FROM public.student_periods sp
            INNER JOIN public.students s ON s.id = sp.student_id
            WHERE sp.period_id = ${periodId}::uuid
        )
        SELECT
            COUNT(*) FILTER (WHERE status = 'ENROLLED')::int AS enrolled,
            COUNT(*) FILTER (WHERE status = 'WAITING')::int AS waiting,
            COUNT(*) FILTER (WHERE is_class_enrolled AND accessed_at IS NOT NULL)::int AS sad_viewed,
            COUNT(*) FILTER (WHERE is_class_enrolled AND accessed_at IS NULL)::int AS sad_not_viewed,
            COUNT(*) FILTER (
                WHERE origin_school IS NOT NULL AND origin_school <> ''
            )::int AS transferred,
            COUNT(*) FILTER (
                WHERE origin_school IS NULL OR origin_school = ''
            )::int AS not_transferred
        FROM period_students
    `;

    return {
        enrolled: row?.enrolled ?? 0,
        waiting: row?.waiting ?? 0,
        sadViewed: row?.sad_viewed ?? 0,
        sadNotViewed: row?.sad_not_viewed ?? 0,
        transferred: row?.transferred ?? 0,
        notTransferred: row?.not_transferred ?? 0,
    };
}

/**
 * Distribuição de alunos por turno e por turma no período.
 */
export async function getPeriodStructureDistribution(periodId: string): Promise<PeriodStructureDistribution> {
    "use cache";
    cacheLife("days");
    cacheTag(`period:${periodId}:indicators`);

    const [row] = await prisma.$queryRaw<{
        by_shift: { shift: string; count: number }[] | null;
        by_class_group: { name: string; count: number }[] | null;
    }[]>`
        WITH shift_counts AS (
            SELECT
                cg.shift::text AS shift,
                COUNT(DISTINCT e.student_id)::int AS count
            FROM public.class_groups cg
            JOIN public.courses c ON c.class_group_id = cg.id
            JOIN public.enrollments e ON e.course_id = c.id
            WHERE cg.period_id = ${periodId}::uuid
            GROUP BY cg.shift
        ),
        class_group_counts AS (
            SELECT
                cg.name,
                COUNT(DISTINCT e.student_id)::int AS count
            FROM public.class_groups cg
            LEFT JOIN public.courses c ON c.class_group_id = cg.id
            LEFT JOIN public.enrollments e ON e.course_id = c.id
            WHERE cg.period_id = ${periodId}::uuid
            GROUP BY cg.id, cg.name
        )
        SELECT
            COALESCE(
                (SELECT json_agg(json_build_object('shift', shift, 'count', count)) FROM shift_counts),
                '[]'::json
            ) AS by_shift,
            COALESCE(
                (
                    SELECT json_agg(json_build_object('name', name, 'count', count) ORDER BY count DESC, name ASC)
                    FROM class_group_counts
                ),
                '[]'::json
            ) AS by_class_group
    `;

    const shiftCounts = new Map(
        (row?.by_shift ?? []).map((entry) => [entry.shift, entry.count]),
    );

    return {
        byShift: PERIOD_SHIFTS.map((shift) => ({
            shift,
            count: shiftCounts.get(shift) ?? 0,
        })),
        byClassGroup: row?.by_class_group ?? [],
    };
}
