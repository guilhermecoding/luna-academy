import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { getPeriodStructureDistribution } from "@/services/periods/period-indicators.service";
import { IconSchool } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodClassGroupBarChartClient from "./period-class-group-bar-chart-client";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
    count: {
        label: "Alunos",
    },
} satisfies ChartConfig;

async function PeriodClassGroupChartContent({ periodId }: { periodId: string }) {
    const { byClassGroup } = await getPeriodStructureDistribution(periodId);

    return <PeriodClassGroupBarChartClient data={byClassGroup} config={chartConfig} />;
}

export default function PeriodClassGroupChart({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Alunos por turma"
            icon={<IconSchool className="size-5" />}
            className="w-full xl:w-3/5"
        >
            <Suspense fallback={<ChartAreaSkeleton />}>
                <PeriodClassGroupChartContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
