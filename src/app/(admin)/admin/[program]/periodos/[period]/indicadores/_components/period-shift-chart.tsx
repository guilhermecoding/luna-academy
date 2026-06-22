import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { getPeriodStructureDistribution } from "@/services/periods/period-indicators.service";
import { shiftLabels } from "@/app/(admin)/admin/[program]/periodos/[period]/turmas/schema";
import { IconClockHour4 } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodShiftBarChartClient, { SHIFT_COLORS } from "./period-shift-bar-chart-client";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
    count: {
        label: "Alunos",
    },
    MORNING: {
        label: shiftLabels.MORNING,
        color: SHIFT_COLORS.MORNING,
    },
    AFTERNOON: {
        label: shiftLabels.AFTERNOON,
        color: SHIFT_COLORS.AFTERNOON,
    },
    EVENING: {
        label: shiftLabels.EVENING,
        color: SHIFT_COLORS.EVENING,
    },
} satisfies ChartConfig;

async function PeriodShiftChartContent({ periodId }: { periodId: string }) {
    const { byShift } = await getPeriodStructureDistribution(periodId);
    const data = byShift.map(({ shift, count }) => ({
        shift,
        label: shiftLabels[shift],
        count,
        fill: SHIFT_COLORS[shift],
    }));

    return <PeriodShiftBarChartClient data={data} config={chartConfig} />;
}

export default function PeriodShiftChart({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Alunos por turno"
            icon={<IconClockHour4 className="size-5" />}
            className="w-full xl:w-2/5"
        >
            <Suspense fallback={<ChartAreaSkeleton />}>
                <PeriodShiftChartContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
