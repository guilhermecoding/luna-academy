"use client";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { PERIOD_CLASS_GROUP_FILL } from "@/lib/period-chart-colors";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

export type PeriodClassGroupBarChartDataPoint = {
    name: string;
    count: number;
};

type PeriodClassGroupBarChartClientProps = {
    data: PeriodClassGroupBarChartDataPoint[];
    config: ChartConfig;
};

export default function PeriodClassGroupBarChartClient({
    data,
    config,
}: PeriodClassGroupBarChartClientProps) {
    const total = data.reduce((sum, entry) => sum + entry.count, 0);

    return (
        <ChartContainer config={config} className="aspect-auto h-72 w-full">
            <BarChart
                accessibilityLayer
                layout="vertical"
                data={data}
                margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
            >
                <CartesianGrid horizontal={false} />
                <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={120}
                    tick={{ fontSize: 12 }}
                />
                <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            hideLabel
                            nameKey="name"
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
                    fill={PERIOD_CLASS_GROUP_FILL}
                    radius={[0, 6, 6, 0]}
                    isAnimationActive
                    animationDuration={800}
                    animationBegin={0}
                >
                    <LabelList
                        position="right"
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                    />
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}
