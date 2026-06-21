"use client";

import dynamic from "next/dynamic";
import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import { useChartAnimationKey } from "@/hooks/use-chart-animation-key";
import { cn } from "@/lib/utils";

function ChartSkeleton({ className }: { className?: string }) {
    return (
        <WrapperFlipCardIndicator title="Carregando..." className={cn("w-full", className)}>
            <div className="h-72 animate-pulse rounded-2xl bg-muted" />
        </WrapperFlipCardIndicator>
    );
}

const StudentsGenderChart = dynamic(
    () => import("./students-gender-chart"),
    {
        loading: () => <ChartSkeleton className="xl:w-2/5" />,
        ssr: false,
    },
);

const StudentsAgeRangeChart = dynamic(
    () => import("./students-age-range-chart"),
    {
        loading: () => <ChartSkeleton className="xl:w-3/5" />,
        ssr: false,
    },
);

export default function StudentsIndicatorsCharts() {
    const chartKey = useChartAnimationKey();

    return (
        <div className="mt-8 flex flex-col gap-8 xl:flex-row">
            <StudentsGenderChart key={`gender-${chartKey}`} />
            <StudentsAgeRangeChart key={`age-${chartKey}`} />
        </div>
    );
}
