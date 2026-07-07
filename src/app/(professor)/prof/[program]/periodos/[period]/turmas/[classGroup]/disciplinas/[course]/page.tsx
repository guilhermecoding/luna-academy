import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ExportStudentsDropdown } from "@/components/export/export-students-dropdown";
import InfoBoxPeriod from "@/app/(admin)/admin/[program]/periodos/[period]/_components/info-box-period";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { getStudentCountByClassGroupId } from "@/services/students/students.service";
import { getLessonsByCourseId } from "@/services/lessons/lessons.service";
import {
    IconBooks,
    IconCalendarEvent,
    IconClockHour2,
    IconUsers,
} from "@tabler/icons-react";
import { notFound, redirect } from "next/navigation";
import { Shift, DayOfWeek } from "@/generated/prisma/enums";
import { Metadata } from "next";
import LessonCardList from "@/app/(admin)/admin/[program]/periodos/[period]/turmas/[classGroup]/disciplinas/[course]/_components/lesson-card-list";
import { CreateLessonSheet } from "@/app/(admin)/admin/[program]/periodos/[period]/turmas/[classGroup]/disciplinas/[course]/_components/create-lesson-dialog";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { filterSchedulesForTeacher, getScheduleTeacherDisplayName, isTeacherAssignedToCourse } from "@/lib/schedule-teacher-utils";
import { generateUpcomingLessons } from "@/lib/lesson-schedule-utils";

export const metadata: Metadata = {
    title: "Detalhes da Disciplina",
};

const shiftMap: Record<Shift, string> = {
    MORNING: "MATUTINO",
    AFTERNOON: "VESPERTINO",
    EVENING: "NOTURNO",
};

async function ProfCoursePageContent({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string; course: string }>;
}) {
    const { program, period, classGroup: classGroupSlug, course: courseCode } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/entrar");
    }

    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) notFound();

    const classGroupData = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroupSlug);
    if (!classGroupData) notFound();

    const courseData = await getCourseByPeriodIdAndCode(periodData.id, courseCode);
    if (!courseData || courseData.classGroupId !== classGroupData.id) notFound();

    if (!isTeacherAssignedToCourse(courseData, session.user.id)) {
        redirect(`/prof/${program}/periodos/${period}/turmas/${classGroupSlug}`);
    }

    const teacherId = session.user.id;
    const visibleSchedules = filterSchedulesForTeacher(courseData.schedules, teacherId);
    const visibleScheduleIds = new Set(visibleSchedules.map((s) => s.id));

    const [studentCount, allLessons] = await Promise.all([
        getStudentCountByClassGroupId(classGroupData.id),
        getLessonsByCourseId(courseData.id),
    ]);

    const lessons = allLessons.filter(
        (l) => l.scheduleId != null && visibleScheduleIds.has(l.scheduleId),
    );
    const lessonsCount = lessons.length;

    const basePath = `/prof/${program}/periodos/${period}/turmas/${classGroupSlug}/disciplinas/${courseCode}`;

    const schedulesWithTimeSlot = visibleSchedules.filter((s) => s.timeSlot);
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
        teacherName: getScheduleTeacherDisplayName(s.teacher),
    }));

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconBooks className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Detalhes da Disciplina</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={courseData.name}
                            description={`Disciplina ${courseData.name} da turma ${classGroupData.name}.`}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-1 gap-3 justify-end items-end">
                        <ExportStudentsDropdown
                            exportPath={`/api/prof/${program}/periodos/${period}/turmas/${classGroupSlug}/disciplinas/${courseCode}/alunos/export`}
                            ariaLabel="Exportar alunos da disciplina"
                        />
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoBoxPeriod
                    label="ALUNOS MATRICULADOS"
                    value={studentCount}
                    color="emerald"
                    icon={<IconUsers className="size-full" />}
                />
                <InfoBoxPeriod
                    label="AULAS REGISTRADAS"
                    value={lessonsCount}
                    color="indigo"
                    icon={<IconCalendarEvent className="size-full" />}
                />
                <InfoBoxPeriod
                    label="TURNO"
                    value={shiftMap[courseData.shift] || courseData.shift}
                    color="amber"
                    icon={<IconClockHour2 className="size-full" />}
                />
            </Section>

            <Section className="mt-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-row items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <IconCalendarEvent className="size-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Diário de Aulas</h2>
                            {upcomingLessons.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {lessonsCount} registrada{lessonsCount !== 1 ? "s" : ""} • {upcomingLessons.length} prevista{upcomingLessons.length !== 1 ? "s" : ""}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Botão de Criação de Aula mantido */}
                    <CreateLessonSheet
                        programSlug={program}
                        periodSlug={period}
                        classGroupSlug={classGroupSlug}
                        courseCode={courseCode}
                        schedules={scheduleOptions}
                    />
                </div>

                <LessonCardList
                    lessons={lessons}
                    upcomingLessons={upcomingLessons}
                    basePath={basePath}
                    programSlug={program}
                    periodSlug={period}
                    classGroupSlug={classGroupSlug}
                    courseCode={courseCode}
                    schedules={scheduleOptions}
                />
            </Section>
        </Page>
    );
}

export default function ProfCoursePage({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string; course: string }>;
}) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <ProfCoursePageContent params={params} />
        </Suspense>
    );
}
