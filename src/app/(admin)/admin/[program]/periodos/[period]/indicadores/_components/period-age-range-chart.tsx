import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { AGE_RANGE_INTERVALS, AGE_RANGE_VALUES } from "@/lib/age-range";
import { AGE_RANGE_CHART_FILLS } from "@/lib/period-chart-colors";
import { getPeriodStudentDemographics } from "@/services/periods/period-indicators.service";
import { IconRating12Plus } from "@tabler/icons-react";
import { Suspense } from "react";
import StudentsAgeRangeChartClient from "@/app/(admin)/admin/alunos/indicadores/_components/students-age-range-chart-client";

async function PeriodAgeRangeChartContent({ periodId }: { periodId: string }) {
    const { ageRange } = await getPeriodStudentDemographics(periodId);
    const data = AGE_RANGE_VALUES.map((range) => ({
        range,
        interval: AGE_RANGE_INTERVALS[range],
        count: ageRange[range],
        fill: AGE_RANGE_CHART_FILLS[range],
    }));

    return <StudentsAgeRangeChartClient data={data} />;
}

export default function PeriodAgeRangeChart({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Faixa etária"
            icon={<IconRating12Plus className="size-5" />}
            className="w-full xl:w-3/5"
        >
            <Suspense fallback={<ChartAreaSkeleton />}>
                <PeriodAgeRangeChartContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
