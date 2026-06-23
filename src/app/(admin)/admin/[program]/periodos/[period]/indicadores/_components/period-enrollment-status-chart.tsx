import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import {
    enrollmentStatusChartConfig,
    PERIOD_ENROLLMENT_CHART_FILLS,
} from "@/lib/period-chart-colors";
import { getPeriodProportionStats } from "@/services/periods/period-indicators.service";
import { IconCircleCheck } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodProportionDonutChartClient from "./period-proportion-donut-chart-client";

async function PeriodEnrollmentStatusChartContent({ periodId }: { periodId: string }) {
    const { enrolled, waiting } = await getPeriodProportionStats(periodId);
    const data = [
        { key: "ENROLLED", count: enrolled, fill: PERIOD_ENROLLMENT_CHART_FILLS.ENROLLED },
        { key: "WAITING", count: waiting, fill: PERIOD_ENROLLMENT_CHART_FILLS.WAITING },
    ];

    return (
        <PeriodProportionDonutChartClient
            data={data}
            config={enrollmentStatusChartConfig}
        />
    );
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
