import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import {
    PERIOD_ATTENDANCE_CHART_FILLS,
    attendanceChartConfig,
} from "@/lib/period-chart-colors";
import { getPeriodAttendanceStats } from "@/services/periods/period-indicators.service";
import { IconUserCheck } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodProportionDonutChartClient from "./period-proportion-donut-chart-client";

async function PeriodAttendanceChartContent({ periodId }: { periodId: string }) {
    const { present, absent, rate, closedLessonsCount } = await getPeriodAttendanceStats(periodId);
    const data = [
        { key: "PRESENT", count: present, fill: PERIOD_ATTENDANCE_CHART_FILLS.PRESENT },
        { key: "ABSENT", count: absent, fill: PERIOD_ATTENDANCE_CHART_FILLS.ABSENT },
    ];

    return (
        <div className="flex flex-col gap-2">
            <div className="text-center">
                <span className="text-foreground text-3xl font-bold">{rate}%</span>
                <p className="text-sm text-muted-foreground mt-1">
                    {closedLessonsCount} {closedLessonsCount === 1 ? "aula fechada" : "aulas fechadas"}
                </p>
            </div>
            <PeriodProportionDonutChartClient
                data={data}
                config={attendanceChartConfig}
            />
        </div>
    );
}

export default function PeriodAttendanceChart({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Frequência média do período"
            icon={<IconUserCheck className="size-5" />}
            className="w-full @3xl/main:col-span-1"
        >
            <Suspense fallback={<ChartAreaSkeleton />}>
                <PeriodAttendanceChartContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
