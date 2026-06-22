import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { getPeriodProportionStats } from "@/services/periods/period-indicators.service";
import { IconSwipeRightFilled } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodProportionDonutChartClient from "./period-proportion-donut-chart-client";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
    count: {
        label: "Alunos",
    },
    TRANSFERRED: {
        label: "Transferidos",
        color: "var(--chart-3)",
    },
    NOT_TRANSFERRED: {
        label: "Sem origem informada",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig;

async function PeriodTransferChartContent({ periodId }: { periodId: string }) {
    const { transferred, notTransferred } = await getPeriodProportionStats(periodId);
    const data = [
        { key: "TRANSFERRED", count: transferred, fill: "var(--color-TRANSFERRED)" },
        { key: "NOT_TRANSFERRED", count: notTransferred, fill: "var(--color-NOT_TRANSFERRED)" },
    ];

    return <PeriodProportionDonutChartClient data={data} config={chartConfig} />;
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
