"use client";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { AGE_RANGE_INTERVALS, AGE_RANGE_LABELS_PT, type AgeRangeValue } from "@/lib/age-range";
import { AGE_RANGE_CHART_FILLS } from "@/lib/period-chart-colors";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export type PeriodAgeRangeByShiftChartDataPoint = {
    shiftLabel: string;
} & Record<AgeRangeValue, number>;

type PeriodAgeRangeByShiftChartClientProps = {
    data: PeriodAgeRangeByShiftChartDataPoint[];
    ageRanges: AgeRangeValue[];
    config: ChartConfig;
};

export default function PeriodAgeRangeByShiftChartClient({
    data,
    ageRanges,
    config,
}: PeriodAgeRangeByShiftChartClientProps) {
    return (
        <div className="flex w-full min-w-0 flex-col gap-3">
            <ChartContainer config={config} className="aspect-auto h-64 w-full min-w-0 sm:h-72">
                <BarChart
                    accessibilityLayer
                    data={data}
                    margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="shiftLabel"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={
                            <ChartTooltipContent
                                labelFormatter={(_, payload) => {
                                    const item = payload?.[0]?.payload as PeriodAgeRangeByShiftChartDataPoint | undefined;
                                    return item?.shiftLabel ?? "";
                                }}
                                formatter={(value, name) => {
                                    const label = AGE_RANGE_LABELS_PT[name as AgeRangeValue] ?? name;
                                    return (
                                        <span className="font-mono font-medium tabular-nums">
                                            {label}: {value}
                                        </span>
                                    );
                                }}
                            />
                        }
                    />
                    {ageRanges.map((range) => (
                        <Bar
                            key={range}
                            dataKey={range}
                            stackId="ageRange"
                            fill={AGE_RANGE_CHART_FILLS[range]}
                            isAnimationActive
                            animationDuration={800}
                            animationBegin={0}
                        />
                    ))}
                </BarChart>
            </ChartContainer>

            <div className="flex w-full min-w-0 flex-wrap justify-center gap-x-3 gap-y-2 px-1">
                {ageRanges.map((range) => (
                    <div
                        key={range}
                        className="flex max-w-full items-center gap-1.5 text-[11px] leading-tight text-muted-foreground sm:text-xs"
                    >
                        <div
                            className="size-2 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: AGE_RANGE_CHART_FILLS[range] }}
                        />
                        <span className="whitespace-nowrap sm:hidden">
                            {AGE_RANGE_INTERVALS[range]}
                        </span>
                        <span className="hidden whitespace-nowrap sm:inline">
                            {AGE_RANGE_LABELS_PT[range]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
