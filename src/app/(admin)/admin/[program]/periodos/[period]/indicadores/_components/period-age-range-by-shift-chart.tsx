import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { AGE_RANGE_VALUES } from "@/lib/age-range";
import { ageRangeChartConfig } from "@/lib/period-chart-colors";
import { shiftLabels } from "@/app/(admin)/admin/[program]/periodos/[period]/turmas/schema";
import { getPeriodAgeRangeByShift } from "@/services/periods/period-indicators.service";
import { IconRating12Plus } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodAgeRangeByShiftChartClient from "./period-age-range-by-shift-chart-client";

async function PeriodAgeRangeByShiftChartContent({ periodId }: { periodId: string }) {
    const { byShift } = await getPeriodAgeRangeByShift(periodId);
    const data = byShift.map(({ shift, ageRange }) => ({
        shiftLabel: shiftLabels[shift],
        ...ageRange,
    }));

    return (
        <PeriodAgeRangeByShiftChartClient
            data={data}
            ageRanges={[...AGE_RANGE_VALUES]}
            config={ageRangeChartConfig}
        />
    );
}

export default function PeriodAgeRangeByShiftChart({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Faixa etária por turno"
            icon={<IconRating12Plus className="size-5" />}
            className="w-full"
        >
            <Suspense fallback={<ChartAreaSkeleton />}>
                <PeriodAgeRangeByShiftChartContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
