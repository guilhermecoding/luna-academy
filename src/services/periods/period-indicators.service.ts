import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

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
