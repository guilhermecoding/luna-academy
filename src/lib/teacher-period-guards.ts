import type { Period } from "@/generated/prisma/client";
import { requireAdminWrite, requireTeacherWrite } from "@/lib/auth-guards";
import prisma from "@/lib/prisma";
import {
    filterSchedulesForTeacher,
    isTeacherAssignedToCourse,
    isTeacherAssignedToSchedule,
} from "@/lib/schedule-teacher-utils";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { getPeriodsForTeacherByProgramSlug } from "@/services/programs/programs.service";
import { notFound, redirect } from "next/navigation";

type GuardFail = { ok: false; error: string };
type GuardOk = { ok: true; session: { user: { id: string } } };

type TeacherPeriodAccessFail = {
    ok: false;
    reason: "not_found" | "completed" | "unauthorized";
};

type TeacherPeriodAccessOk = {
    ok: true;
    period: Period;
};

export type TeacherPeriodAccess = TeacherPeriodAccessOk | TeacherPeriodAccessFail;

/**
 * Verifica se o professor pode acessar um período ativo (não finalizado).
 */
export async function getTeacherPeriodAccess(
    programSlug: string,
    periodSlug: string,
    teacherId: string,
): Promise<TeacherPeriodAccess> {
    const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);

    if (!period) {
        return { ok: false, reason: "not_found" };
    }

    if (period.completedAt) {
        return { ok: false, reason: "completed" };
    }

    const teacherPeriods = await getPeriodsForTeacherByProgramSlug(programSlug, teacherId);
    const hasAccess = teacherPeriods.some((p) => p.slug === periodSlug);

    if (!hasAccess) {
        return { ok: false, reason: "unauthorized" };
    }

    return { ok: true, period };
}

/**
 * Bloqueia navegação quando o período não está acessível ao professor.
 * Usado no template do segmento `[period]`.
 */
export async function enforceTeacherPeriodAccess(
    programSlug: string,
    periodSlug: string,
    teacherId: string,
): Promise<Period> {
    const access = await getTeacherPeriodAccess(programSlug, periodSlug, teacherId);

    if (!access.ok) {
        if (access.reason === "not_found" || access.reason === "completed") {
            notFound();
        }

        redirect(`/prof/${programSlug}/periodos`);
    }

    return access.period;
}

/**
 * Valida acesso de escrita de professor a um período ativo.
 */
export async function requireTeacherActivePeriod(
    programSlug: string,
    periodSlug: string,
    teacherId: string,
): Promise<{ ok: true; period: Period } | GuardFail> {
    const access = await getTeacherPeriodAccess(programSlug, periodSlug, teacherId);

    if (!access.ok) {
        if (access.reason === "not_found") {
            return { ok: false, error: "Período não encontrado." };
        }

        if (access.reason === "completed") {
            return { ok: false, error: "Este período foi finalizado." };
        }

        return { ok: false, error: "Não autorizado." };
    }

    return { ok: true, period: access.period };
}

type ResolvedCourseContext = {
    period: Period;
    classGroup: NonNullable<Awaited<ReturnType<typeof getClassGroupByPeriodIdAndSlug>>>;
    course: NonNullable<Awaited<ReturnType<typeof getCourseByPeriodIdAndCode>>>;
};

type CourseMutationAccess =
    | { ok: true; session: GuardOk["session"]; resolved: ResolvedCourseContext }
    | GuardFail;

async function resolveCourseBySlugs(
    programSlug: string,
    periodSlug: string,
    classGroupSlug: string,
    courseCode: string,
): Promise<ResolvedCourseContext | { error: string }> {
    const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);
    if (!period) return { error: "Período não encontrado." };

    const classGroup = await getClassGroupByPeriodIdAndSlug(period.id, classGroupSlug);
    if (!classGroup) return { error: "Turma não encontrada." };

    const course = await getCourseByPeriodIdAndCode(period.id, courseCode);
    if (!course || course.classGroupId !== classGroup.id) {
        return { error: "Disciplina não encontrada." };
    }

    return { period, classGroup, course };
}

export function getTeacherVisibleScheduleIds(
    course: NonNullable<Awaited<ReturnType<typeof getCourseByPeriodIdAndCode>>>,
    teacherId: string,
): Set<string> {
    return new Set(
        filterSchedulesForTeacher(course.schedules, teacherId).map((s) => s.id),
    );
}

async function teacherCanAccessSchedule(
    courseId: string,
    scheduleId: string | null | undefined,
    teacherId: string,
): Promise<boolean> {
    if (!scheduleId) return false;

    const schedule = await prisma.schedule.findFirst({
        where: { id: scheduleId, courseId },
        select: {
            id: true,
            teacherId: true,
            assistants: { select: { assistantId: true } },
        },
    });

    if (!schedule) return false;
    return isTeacherAssignedToSchedule(schedule, teacherId);
}

/**
 * Permite mutações de admin em qualquer estado do período,
 * ou de professor apenas em período ativo na disciplina em que possui slot.
 */
export async function requireCourseMutationAccess(
    programSlug: string,
    periodSlug: string,
    classGroupSlug: string,
    courseCode: string,
): Promise<CourseMutationAccess> {
    const adminResult = await requireAdminWrite();
    if (adminResult.ok) {
        const resolved = await resolveCourseBySlugs(programSlug, periodSlug, classGroupSlug, courseCode);
        if ("error" in resolved) {
            return { ok: false, error: resolved.error };
        }

        return { ok: true, session: adminResult.session, resolved };
    }

    const teacherResult = await requireTeacherWrite();
    if (!teacherResult.ok) {
        return teacherResult;
    }

    const periodAccess = await requireTeacherActivePeriod(
        programSlug,
        periodSlug,
        teacherResult.session.user.id,
    );
    if (!periodAccess.ok) {
        return periodAccess;
    }

    const resolved = await resolveCourseBySlugs(programSlug, periodSlug, classGroupSlug, courseCode);
    if ("error" in resolved) {
        return { ok: false, error: resolved.error };
    }

    if (!isTeacherAssignedToCourse(resolved.course, teacherResult.session.user.id)) {
        return { ok: false, error: "Não autorizado." };
    }

    return { ok: true, session: teacherResult.session, resolved };
}

/**
 * Valida se professor pode mutar aula vinculada a um schedule específico.
 */
export async function requireTeacherScheduleMutationAccess(
    courseId: string,
    scheduleId: string | null | undefined,
    teacherId: string,
): Promise<GuardFail | GuardOk> {
    const allowed = await teacherCanAccessSchedule(courseId, scheduleId, teacherId);
    if (!allowed) {
        return { ok: false, error: "Não autorizado para este horário." };
    }
    return { ok: true, session: { user: { id: teacherId } } };
}

type LessonAttendanceMutationAccess =
    | { ok: true; session: GuardOk["session"]; courseId: string; lessonId: string }
    | GuardFail;

/**
 * Permite salvar presenças para admin ou professor alocado ao slot da aula.
 */
export async function requireLessonAttendanceMutationAccess(
    courseId: string,
    lessonId: string,
): Promise<LessonAttendanceMutationAccess> {
    const adminResult = await requireAdminWrite();
    if (adminResult.ok) {
        const lesson = await prisma.lesson.findFirst({
            where: { id: lessonId, courseId },
            select: { id: true },
        });

        if (!lesson) {
            return { ok: false, error: "Aula não encontrada." };
        }

        return { ok: true, session: adminResult.session, courseId, lessonId };
    }

    const teacherResult = await requireTeacherWrite();
    if (!teacherResult.ok) {
        return teacherResult;
    }

    const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, courseId },
        select: {
            id: true,
            scheduleId: true,
            course: {
                select: {
                    id: true,
                    period: {
                        select: {
                            completedAt: true,
                            slug: true,
                            program: { select: { slug: true } },
                        },
                    },
                },
            },
        },
    });

    if (!lesson) {
        return { ok: false, error: "Aula não encontrada." };
    }

    const programSlug = lesson.course.period.program.slug;
    const periodSlug = lesson.course.period.slug;

    const periodAccess = await requireTeacherActivePeriod(
        programSlug,
        periodSlug,
        teacherResult.session.user.id,
    );
    if (!periodAccess.ok) {
        return periodAccess;
    }

    const scheduleAccess = await requireTeacherScheduleMutationAccess(
        courseId,
        lesson.scheduleId,
        teacherResult.session.user.id,
    );
    if (!scheduleAccess.ok) {
        return scheduleAccess;
    }

    return { ok: true, session: teacherResult.session, courseId, lessonId };
}
