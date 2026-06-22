import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { getPeriodProportionStats } from "@/services/periods/period-indicators.service";
import { IconReportSearch } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodProportionDonutChartClient from "./period-proportion-donut-chart-client";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
    count: {
        label: "Alunos",
    },
    VIEWED: {
        label: "Visualizou",
        color: "var(--chart-2)",
    },
    NOT_VIEWED: {
        label: "Não visualizou",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

async function PeriodSadAccessChartContent({ periodId }: { periodId: string }) {
    const { sadViewed, sadNotViewed } = await getPeriodProportionStats(periodId);
    const data = [
        { key: "VIEWED", count: sadViewed, fill: "var(--color-VIEWED)" },
        { key: "NOT_VIEWED", count: sadNotViewed, fill: "var(--color-NOT_VIEWED)" },
    ];

    return <PeriodProportionDonutChartClient data={data} config={chartConfig} />;
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
