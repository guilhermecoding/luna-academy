import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { SHIFT_CHART_FILLS, shiftChartConfig } from "@/lib/period-chart-colors";
import { shiftLabels } from "@/app/(admin)/admin/[program]/periodos/[period]/turmas/schema";
import { getPeriodStructureDistribution } from "@/services/periods/period-indicators.service";
import { IconClockHour4 } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodShiftBarChartClient from "./period-shift-bar-chart-client";

async function PeriodShiftChartContent({ periodId }: { periodId: string }) {
    const { byShift } = await getPeriodStructureDistribution(periodId);
    const data = byShift.map(({ shift, count }) => ({
        shift,
        label: shiftLabels[shift],
        count,
        fill: SHIFT_CHART_FILLS[shift],
    }));

    return <PeriodShiftBarChartClient data={data} config={shiftChartConfig} />;
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
