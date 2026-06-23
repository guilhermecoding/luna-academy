import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { GENRE_VALUES } from "@/lib/genre";
import { GENRE_CHART_FILLS } from "@/lib/period-chart-colors";
import { getPeriodStudentDemographics } from "@/services/periods/period-indicators.service";
import { IconGenderBigender } from "@tabler/icons-react";
import { Suspense } from "react";
import StudentsGenderChartClient from "@/app/(admin)/admin/alunos/indicadores/_components/students-gender-chart-client";

async function PeriodGenderChartContent({ periodId }: { periodId: string }) {
    const { gender } = await getPeriodStudentDemographics(periodId);
    const data = GENRE_VALUES.map((genre) => ({
        genre,
        count: gender[genre],
        fill: GENRE_CHART_FILLS[genre],
    }));

    return <StudentsGenderChartClient data={data} />;
}

export default function PeriodGenderChart({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Gênero"
            icon={<IconGenderBigender className="size-5" />}
            className="w-full xl:w-2/5"
        >
            <Suspense fallback={<ChartAreaSkeleton />}>
                <PeriodGenderChartContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
