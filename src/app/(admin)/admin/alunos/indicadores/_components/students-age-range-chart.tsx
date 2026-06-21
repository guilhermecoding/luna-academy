import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { AGE_RANGE_INTERVALS, AGE_RANGE_VALUES } from "@/lib/age-range";
import { getStudentsAgeRangeDistribution } from "@/services/students/students.service";
import { IconRating12Plus } from "@tabler/icons-react";
import { Suspense } from "react";
import StudentsAgeRangeChartClient from "./students-age-range-chart-client";

async function StudentsAgeRangeChartContent() {
    const distribution = await getStudentsAgeRangeDistribution();
    const data = AGE_RANGE_VALUES.map((range) => ({
        range,
        interval: AGE_RANGE_INTERVALS[range],
        count: distribution[range],
        fill: `var(--color-${range})`,
    }));

    return <StudentsAgeRangeChartClient data={data} />;
}

export default function StudentsAgeRangeChart() {
    return (
        <WrapperFlipCardIndicator
            title="Faixa etária"
            icon={<IconRating12Plus className="size-5" />}
            className="w-full xl:w-3/5"
        >
            <Suspense fallback={<ChartAreaSkeleton />}>
                <StudentsAgeRangeChartContent />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
