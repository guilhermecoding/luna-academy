"use client";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

export type PeriodClassGroupsComparisonDataPoint = {
    name: string;
    count: number;
    fill: string;
    isCurrent: boolean;
};

type PeriodClassGroupsComparisonBarChartClientProps = {
    data: PeriodClassGroupsComparisonDataPoint[];
    config: ChartConfig;
};

export default function PeriodClassGroupsComparisonBarChartClient({
    data,
    config,
}: PeriodClassGroupsComparisonBarChartClientProps) {
    return (
        <ChartContainer config={config} className="aspect-auto h-72 w-full">
            <BarChart
                accessibilityLayer
                data={data}
                margin={{ top: 20, right: 8, left: 8, bottom: 0 }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    interval={0}
                    tick={{ fontSize: 11 }}
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
                            hideLabel
                            nameKey="name"
                            formatter={(value) => (
                                <span className="font-mono font-medium tabular-nums">
                                    {value}
                                </span>
                            )}
                        />
                    }
                />
                <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive
                    animationDuration={800}
                    animationBegin={0}
                >
                    {data.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                    ))}
                    <LabelList
                        position="top"
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                    />
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}
