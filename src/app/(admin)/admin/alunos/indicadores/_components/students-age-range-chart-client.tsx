"use client";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import {
    AGE_RANGE_LABELS_PT,
    type AgeRangeValue,
} from "@/lib/age-range";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

export type StudentsAgeRangeChartDataPoint = {
    range: AgeRangeValue;
    interval: string;
    count: number;
    fill: string;
};

const AGE_RANGE_COLORS: Record<AgeRangeValue, string> = {
    BABY: "var(--age-range-baby)",
    CHILDREN_I: "var(--age-range-children-i)",
    CHILDREN_II: "var(--age-range-children-ii)",
    TEEN: "var(--age-range-teen)",
    YOUNG: "var(--age-range-young)",
    ADULT: "var(--age-range-adult)",
    SENIOR: "var(--age-range-senior)",
};

const chartConfig = {
    count: {
        label: "Alunos",
    },
    ...Object.fromEntries(
        Object.entries(AGE_RANGE_COLORS).map(([range, color]) => [
            range,
            {
                label: AGE_RANGE_LABELS_PT[range as AgeRangeValue],
                color,
            },
        ]),
    ),
} satisfies ChartConfig;

type StudentsAgeRangeChartClientProps = {
    data: StudentsAgeRangeChartDataPoint[];
};

export default function StudentsAgeRangeChartClient({ data }: StudentsAgeRangeChartClientProps) {
    const total = data.reduce((sum, entry) => sum + entry.count, 0);

    return (
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
            <BarChart
                accessibilityLayer
                data={data}
                margin={{ top: 20, right: 8, left: 8, bottom: 0 }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="interval"
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
                            nameKey="range"
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
                        <Cell key={entry.range} fill={entry.fill} />
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
