import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { getPeriodProportionStats } from "@/services/periods/period-indicators.service";
import { IconCircleCheck } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodProportionDonutChartClient from "./period-proportion-donut-chart-client";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
    count: {
        label: "Alunos",
    },
    ENROLLED: {
        label: "Matriculados",
        color: "var(--chart-2)",
    },
    WAITING: {
        label: "Em espera",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

async function PeriodEnrollmentStatusChartContent({ periodId }: { periodId: string }) {
    const { enrolled, waiting } = await getPeriodProportionStats(periodId);
    const data = [
        { key: "ENROLLED", count: enrolled, fill: "var(--color-ENROLLED)" },
        { key: "WAITING", count: waiting, fill: "var(--color-WAITING)" },
    ];

    return <PeriodProportionDonutChartClient data={data} config={chartConfig} />;
}

export default function PeriodEnrollmentStatusChart({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Status de matrícula"
            icon={<IconCircleCheck className="size-5" />}
            className="w-full"
        >
            <Suspense fallback={<ChartAreaSkeleton />}>
                <PeriodEnrollmentStatusChartContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
