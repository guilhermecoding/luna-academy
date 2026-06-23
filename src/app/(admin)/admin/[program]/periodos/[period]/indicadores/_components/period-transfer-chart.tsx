import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { PERIOD_TRANSFER_CHART_FILLS, transferChartConfig } from "@/lib/period-chart-colors";
import { getPeriodProportionStats } from "@/services/periods/period-indicators.service";
import { IconSwipeRightFilled } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodProportionDonutChartClient from "./period-proportion-donut-chart-client";

async function PeriodTransferChartContent({ periodId }: { periodId: string }) {
    const { transferred, notTransferred } = await getPeriodProportionStats(periodId);
    const data = [
        { key: "TRANSFERRED", count: transferred, fill: PERIOD_TRANSFER_CHART_FILLS.TRANSFERRED },
        { key: "NOT_TRANSFERRED", count: notTransferred, fill: PERIOD_TRANSFER_CHART_FILLS.NOT_TRANSFERRED },
    ];

    return (
        <PeriodProportionDonutChartClient
            data={data}
            config={transferChartConfig}
        />
    );
}

export default function PeriodTransferChart({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Transferidos"
            icon={<IconSwipeRightFilled className="size-5" />}
            className="w-full"
        >
            <Suspense fallback={<ChartAreaSkeleton />}>
                <PeriodTransferChartContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
