import PageSkeleton from "@/components/skeletons/page-skeleton";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { isTeacherAssignedToCourse } from "@/lib/schedule-teacher-utils";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function CourseLessonsLayoutContent({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string; period: string; classGroup: string; course: string }>;
}>) {
    const { program: programSlug, period: periodSlug, classGroup: classGroupSlug, course: courseCode } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/entrar");
    }

    const periodData = await getPeriodByProgramAndSlug(programSlug, periodSlug);
    if (!periodData) return notFound();

    const classGroup = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroupSlug);
    if (!classGroup) return notFound();

    const courseData = await getCourseByPeriodIdAndCode(periodData.id, courseCode);
    if (!courseData || courseData.classGroupId !== classGroup.id) return notFound();

    const hasAccess = isTeacherAssignedToCourse(courseData, session.user.id);

    if (!hasAccess) {
        redirect(`/prof/${programSlug}/periodos/${periodSlug}/turmas/${classGroupSlug}`);
    }

    return <>{children}</>;
}

export default function CourseLessonsTeacherLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string; period: string; classGroup: string; course: string }>;
}>) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <CourseLessonsLayoutContent params={params}>
                {children}
            </CourseLessonsLayoutContent>
        </Suspense>
    );
}
