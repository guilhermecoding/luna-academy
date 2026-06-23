import { Metadata } from "next";
import Page from "@/components/page";
import Section from "@/components/section";
import { IconAlertSquareRounded, IconCalendar } from "@tabler/icons-react";
import TitlePage from "@/components/title-page";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { notFound } from "next/navigation";
import StudentsPeriodCountFlipCard from "./_components/students-period-count-flip-card";
import EnrolledStudentsPeriodFlipCard from "./_components/enrolled-students-period-flip-card";
import WaitingStudentsPeriodFlipCard from "./_components/waiting-students-period-flip-card";
import EnrollmentRatePeriodFlipCard from "./_components/enrollment-rate-period-flip-card";
import ClassGroupsCountPeriodFlipCard from "./_components/class-groups-count-period-flip-card";
import AvgStudentsPerClassPeriodFlipCard from "./_components/avg-students-per-class-period-flip-card";
import SadAccessPeriodFlipCard from "./_components/sad-access-period-flip-card";
import PeriodStudentsAgeAverageFlipCard from "./_components/period-students-age-average-flip-card";
import PeriodOriginSchoolFlipCard from "./_components/period-origin-school-flip-card";
import PeriodIndicatorsCharts from "./_components/period-indicators-charts";
import { Suspense } from "react";
import AdminPeriodIndicatorPageSkeleton from "./_components/admin-period-indicator-page-skeleton";

export const metadata: Metadata = {
    title: "Indicadores Gerais do Período",
};

async function AdminPeriodIndicatorsPageContent({
    params,
}: Omit<PageProps<"/admin/[program]/periodos/[period]/indicadores">, "searchParams">) {
    const { program, period } = await params;
    const periodData = await getPeriodByProgramAndSlug(program, period);

    if (!periodData) {
        notFound();
    }

    const periodId = periodData.id;

    return (
        <Section className="mt-8 flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-8 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
                <StudentsPeriodCountFlipCard periodId={periodId} />
                <PeriodStudentsAgeAverageFlipCard periodId={periodId} />
                <PeriodOriginSchoolFlipCard periodId={periodId} />
                <EnrolledStudentsPeriodFlipCard periodId={periodId} />
                <WaitingStudentsPeriodFlipCard periodId={periodId} />
                <EnrollmentRatePeriodFlipCard periodId={periodId} />
                <SadAccessPeriodFlipCard periodId={periodId} />
                <ClassGroupsCountPeriodFlipCard periodId={periodId} />
                <AvgStudentsPerClassPeriodFlipCard periodId={periodId} />
            </div>
            <PeriodIndicatorsCharts periodId={periodId} />
        </Section>
    );
}

export default function AdminPeriodIndicatorsPage({
    params,
}: PageProps<"/admin/[program]/periodos/[period]/indicadores">) {
    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconCalendar className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Período</p>
                </div>
                <TitlePage title="Indicadores Gerais do Período" />
                <div className="flex sm:hidden flex-row items-start sm:items-center text-muted-foreground gap-1 shrink-0">
                    <IconAlertSquareRounded className="size-3 mt-0.5 shrink-0" />
                    <p className="text-xs">
                        Gráficos em dispositivos móveis podem ser limitados. Verifique em um dispositivo maior para uma melhor visualização.
                    </p>
                </div>
            </Section>

            <Suspense fallback={<AdminPeriodIndicatorPageSkeleton />}>
                <AdminPeriodIndicatorsPageContent params={params} />
            </Suspense>

        </Page>
    );
}