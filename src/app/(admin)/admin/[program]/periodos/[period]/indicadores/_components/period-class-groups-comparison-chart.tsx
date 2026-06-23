import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import {
    PERIOD_CLASS_GROUPS_CURRENT_FILL,
    PERIOD_CLASS_GROUPS_PREVIOUS_FILL,
    classGroupsComparisonChartConfig,
} from "@/lib/period-chart-colors";
import { getPeriodClassGroupsHistory } from "@/services/periods/period-indicators.service";
import { IconSchool } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodClassGroupsComparisonBarChartClient from "./period-class-groups-comparison-bar-chart-client";

async function PeriodClassGroupsComparisonChartContent({ periodId }: { periodId: string }) {
    const { periods } = await getPeriodClassGroupsHistory(periodId);
    const data = periods.map((period) => ({
        name: period.isCurrent ? `${period.name} (atual)` : period.name,
        count: period.classGroupsCount,
        fill: period.isCurrent
            ? PERIOD_CLASS_GROUPS_CURRENT_FILL
            : PERIOD_CLASS_GROUPS_PREVIOUS_FILL,
        isCurrent: period.isCurrent,
    }));

    return (
        <PeriodClassGroupsComparisonBarChartClient
            data={data}
            config={classGroupsComparisonChartConfig}
        />
    );
}

export default function PeriodClassGroupsComparisonChart({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Turmas por período"
            icon={<IconSchool className="size-5" />}
            className="w-full"
        >
            <Suspense fallback={<ChartAreaSkeleton />}>
                <PeriodClassGroupsComparisonChartContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
