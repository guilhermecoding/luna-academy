import { ExportStudentsDropdown } from "@/components/export/export-students-dropdown";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import InfoBoxPeriod from "../../../../_components/info-box-period";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { getStudentCountByClassGroupId } from "@/services/students/students.service";
import { getLessonsByCourseId, getLessonsCountByCourseId } from "@/services/lessons/lessons.service";
import {
    IconBooks,
    IconCalendarEvent,
    IconClockHour2,
    IconPencil,
    IconUsers,
    IconUser,
} from "@tabler/icons-react";
import { notFound } from "next/navigation";
import { Shift, DayOfWeek } from "@/generated/prisma/enums";
import { Metadata } from "next";
import LessonCardList from "./_components/lesson-card-list";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { Suspense } from "react";
import { requireAdmin, userCanWrite } from "@/lib/auth-guards";
import { generateUpcomingLessons } from "@/lib/lesson-schedule-utils";

export const metadata: Metadata = {
    title: "Detalhes da Disciplina",
};

const shiftMap: Record<Shift, string> = {
    MORNING: "MATUTINO",
    AFTERNOON: "VESPERTINO",
    EVENING: "NOTURNO",
};

const PREVIEW_LESSONS_LIMIT = 5;

async function AdminCoursePageContent({
    params,
}: Omit<PageProps<"/admin/[program]/periodos/[period]/turmas/[classGroup]/disciplinas/[course]">, "searchParams">) {
    const authResult = await requireAdmin();
    if (!authResult.ok) return null;
    const canWrite = userCanWrite(authResult.session.user);

    const { program, period, classGroup: classGroupSlug, course: courseCode } = await params;

    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) notFound();

    const classGroupData = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroupSlug);
    if (!classGroupData) notFound();

    const courseData = await getCourseByPeriodIdAndCode(periodData.id, courseCode);
    if (!courseData || courseData.classGroupId !== classGroupData.id) notFound();

    const [studentCount, lessonsCount, lessons] = await Promise.all([
        getStudentCountByClassGroupId(classGroupData.id),
        getLessonsCountByCourseId(courseData.id),
        getLessonsByCourseId(courseData.id),
    ]);

    const teacher = courseData.schedules.find((s) => s.teacher)?.teacher?.name || "Não atribuído";
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
                            exportPath={`/api/admin/${program}/periodos/${period}/turmas/${classGroupSlug}/disciplinas/${courseCode}/alunos/export`}
                            ariaLabel="Exportar alunos da disciplina"
                        />
                        {canWrite && (
                            <ButtonLink
                                className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid"
                                href={`${basePath}/editar`}
                            >
                                <IconPencil className="size-5" />
                                Editar Disciplina
                            </ButtonLink>
                        )}
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <InfoBoxPeriod
                    label="PROFESSOR"
                    value={teacher}
                    color="purple"
                    icon={<IconUser className="size-full" />}
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
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {lessonsCount} registrada{lessonsCount !== 1 ? "s" : ""}
                                {upcomingLessons.length > 0 && (
                                    <> • {upcomingLessons.length} prevista{upcomingLessons.length !== 1 ? "s" : ""} não registrada{upcomingLessons.length !== 1 ? "s" : ""}</>
                                )}
                            </p>
                        </div>
                    </div>
                    <ButtonLink
                        href={`${basePath}/aulas`}
                        className="w-full sm:w-auto"
                    >
                        Ver todas as aulas
                    </ButtonLink>
                </div>

                <LessonCardList
                    lessons={lessons}
                    basePath={basePath}
                    programSlug={program}
                    periodSlug={period}
                    classGroupSlug={classGroupSlug}
                    courseCode={courseCode}
                    schedules={scheduleOptions}
                    canWrite={canWrite}
                    registeredLimit={PREVIEW_LESSONS_LIMIT}
                    showUpcoming={false}
                    viewAllHref={`${basePath}/aulas`}
                    totalRegisteredCount={lessonsCount}
                    emptyMessage="Nenhuma aula registrada ainda. Acesse a página de aulas para registrar."
                />
            </Section>
        </Page>
    );
}

export default function AdminCoursePage({
    params,
}: PageProps<"/admin/[program]/periodos/[period]/turmas/[classGroup]/disciplinas/[course]">) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <AdminCoursePageContent params={params} />
        </Suspense>
    );
}
