"use server";

import { requireTeacher } from "@/lib/auth-guards";
import { getTeacherPeriodAccess } from "@/lib/teacher-period-guards";

export type TeacherPeriodAccessStatus =
    | "ok"
    | "unauthenticated"
    | "not_found"
    | "completed"
    | "unauthorized";

export async function verifyTeacherPeriodAccessAction(
    programSlug: string,
    periodSlug: string,
): Promise<TeacherPeriodAccessStatus> {
    const authResult = await requireTeacher();
    if (!authResult.ok) {
        return "unauthenticated";
    }

    const access = await getTeacherPeriodAccess(
        programSlug,
        periodSlug,
        authResult.session.user.id,
    );

    if (access.ok) {
        return "ok";
    }

    return access.reason;
}
