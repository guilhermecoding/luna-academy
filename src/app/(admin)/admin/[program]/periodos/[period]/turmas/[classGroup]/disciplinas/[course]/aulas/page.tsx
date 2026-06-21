import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { getLessonsByCourseId, getLessonsCountByCourseId } from "@/services/lessons/lessons.service";
import { notFound } from "next/navigation";
import { DayOfWeek } from "@/generated/prisma/enums";
import { Metadata } from "next";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { requireAdmin, userCanWrite } from "@/lib/auth-guards";
import { generateUpcomingLessons, type LessonFilter } from "@/lib/lesson-schedule-utils";
import { CreateLessonSheet } from "../_components/create-lesson-dialog";
import { LessonsFilteredList } from "../_components/lessons-filtered-list";
import { IconArrowLeft, IconCalendarEvent } from "@tabler/icons-react";

export const metadata: Metadata = {
    title: "Aulas da Disciplina",
};

interface LessonsPageProps
    extends Omit<PageProps<"/admin/[program]/periodos/[period]/turmas/[classGroup]/disciplinas/[course]/aulas">, "searchParams"> {
    searchParams: Promise<{
        filter?: LessonFilter;
        page?: string;
    }>;
}

async function AdminClassGroupCourseLessonsPageContent({
    params,
    searchParams,
}: LessonsPageProps) {
    const authResult = await requireAdmin();
    if (!authResult.ok) return null;
    const canWrite = userCanWrite(authResult.session.user);

    const { program, period, classGroup: classGroupSlug, course: courseCode } = await params;
    const { filter, page: pageParam } = await searchParams;
    const currentPage = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) notFound();

    const classGroupData = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroupSlug);
    if (!classGroupData) notFound();

    const courseData = await getCourseByPeriodIdAndCode(periodData.id, courseCode);
    if (!courseData || courseData.classGroupId !== classGroupData.id) notFound();

    const [lessonsCount, lessons] = await Promise.all([
        getLessonsCountByCourseId(courseData.id),
        getLessonsByCourseId(courseData.id),
    ]);

    const basePath = `/admin/${program}/periodos/${period}/turmas/${classGroupSlug}/disciplinas/${courseCode}`;

    const schedulesWithTimeSlot = courseData.schedules.filter((s) => s.timeSlot);
    const upcomingLessons = generateUpcomingLessons(
        schedulesWithTimeSlot.map((s) => ({
            id: s.id,
            dayOfWeek: s.dayOfWeek as DayOfWeek,
            timeSlotId: s.timeSlotId,
            timeSlot: s.timeSlot,
            teacher: s.teacher,
        })),
        courseData.period.startDate,
        courseData.period.endDate,
        lessons.map((l) => ({ date: l.date, timeSlotId: l.timeSlotId })),
    );

    const scheduleOptions = schedulesWithTimeSlot.map((s) => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        timeSlotId: s.timeSlotId,
        timeSlotName: s.timeSlot.name,
        startTime: s.timeSlot.startTime,
        endTime: s.timeSlot.endTime,
        teacherId: s.teacherId,
        teacherName: s.teacher?.name || null,
    }));

    return (
        <Page>
            <Section>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <div className="flex flex-row items-center gap-1 mb-3">
                            <IconCalendarEvent className="size-4 text-muted-foreground" />
                            <p className="text-muted-foreground font-bold">Diário de Aulas</p>
                        </div>
                        <TitlePage
                            title={`Aulas — ${courseData.name}`}
                            description={`Turma ${classGroupData.name} • ${lessonsCount} registrada${lessonsCount !== 1 ? "s" : ""} • ${upcomingLessons.length} prevista${upcomingLessons.length !== 1 ? "s" : ""} não registrada${upcomingLessons.length !== 1 ? "s" : ""}`}
                        />
                    </div>
                    {canWrite && (
                        <div className="flex flex-col sm:flex-row flex-1 gap-3 justify-end items-end">
                            <CreateLessonSheet
                                programSlug={program}
                                periodSlug={period}
                                classGroupSlug={classGroupSlug}
                                courseCode={courseCode}
                                schedules={scheduleOptions}
                            />
                        </div>
                    )}
                </div>
            </Section>

            <Section className="mt-8">
                <LessonsFilteredList
                    lessons={lessons}
                    upcomingLessons={upcomingLessons}
                    basePath={basePath}
                    programSlug={program}
                    periodSlug={period}
                    classGroupSlug={classGroupSlug}
                    courseCode={courseCode}
                    schedules={scheduleOptions}
                    canWrite={canWrite}
                    currentFilter={filter}
                    currentPage={currentPage}
                />
            </Section>
        </Page>
    );
}

export default function AdminClassGroupCourseLessonsPage({
    params,
    searchParams,
}: LessonsPageProps) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <AdminClassGroupCourseLessonsPageContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
