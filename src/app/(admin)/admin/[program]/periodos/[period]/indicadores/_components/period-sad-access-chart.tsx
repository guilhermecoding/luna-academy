import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { PERIOD_SAD_CHART_FILLS, sadAccessChartConfig } from "@/lib/period-chart-colors";
import { getPeriodProportionStats } from "@/services/periods/period-indicators.service";
import { IconReportSearch } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodProportionDonutChartClient from "./period-proportion-donut-chart-client";

async function PeriodSadAccessChartContent({ periodId }: { periodId: string }) {
    const { sadViewed, sadNotViewed } = await getPeriodProportionStats(periodId);
    const data = [
        { key: "VIEWED", count: sadViewed, fill: PERIOD_SAD_CHART_FILLS.VIEWED },
        { key: "NOT_VIEWED", count: sadNotViewed, fill: PERIOD_SAD_CHART_FILLS.NOT_VIEWED },
    ];

    return (
        <PeriodProportionDonutChartClient
            data={data}
            config={sadAccessChartConfig}
        />
    );
}

export default function PeriodSadAccessChart({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Acesso ao SAD"
            icon={<IconReportSearch className="size-5" />}
            className="w-full"
        >
            <Suspense fallback={<ChartAreaSkeleton />}>
                <PeriodSadAccessChartContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
