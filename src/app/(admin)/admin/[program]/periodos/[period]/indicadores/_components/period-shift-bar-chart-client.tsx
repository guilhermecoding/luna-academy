"use client";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

export type PeriodShiftBarChartDataPoint = {
    shift: string;
    label: string;
    count: number;
    fill: string;
};

type PeriodShiftBarChartClientProps = {
    data: PeriodShiftBarChartDataPoint[];
    config: ChartConfig;
};

export default function PeriodShiftBarChartClient({
    data,
    config,
}: PeriodShiftBarChartClientProps) {
    const total = data.reduce((sum, entry) => sum + entry.count, 0);

    return (
        <ChartContainer config={config} className="aspect-auto h-72 w-full">
            <BarChart
                accessibilityLayer
                data={data}
                margin={{ top: 20, right: 8, left: 8, bottom: 0 }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="label"
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
                            hideLabel
                            nameKey="shift"
                            formatter={(value) => {
                                const count = Number(value);
                                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                                return (
                                    <span className="font-mono font-medium tabular-nums">
                                        {count} ({percentage}%)
                                    </span>
                                );
                            }}
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
                        <Cell key={entry.shift} fill={entry.fill} />
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
