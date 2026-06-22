"use client";

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";

export type PeriodProportionDonutChartDataPoint = {
    key: string;
    count: number;
    fill: string;
};

type PeriodProportionDonutChartClientProps = {
    data: PeriodProportionDonutChartDataPoint[];
    config: ChartConfig;
    nameKey?: string;
};

export default function PeriodProportionDonutChartClient({
    data,
    config,
    nameKey = "key",
}: PeriodProportionDonutChartClientProps) {
    const total = data.reduce((sum, entry) => sum + entry.count, 0);

    return (
        <ChartContainer
            config={config}
            className="mx-auto aspect-square h-72 w-full"
        >
            <PieChart>
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            hideLabel
                            nameKey={nameKey}
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
                <Pie
                    data={data}
                    dataKey="count"
                    nameKey={nameKey}
                    innerRadius="45%"
                    strokeWidth={2}
                    isAnimationActive
                    animationDuration={800}
                    animationBegin={0}
                />
                <ChartLegend
                    content={<ChartLegendContent nameKey={nameKey} />}
                />
            </PieChart>
        </ChartContainer>
    );
}
