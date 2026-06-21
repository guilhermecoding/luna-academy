"use client";

import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import {
    AGE_RANGE_INTERVALS,
    AGE_RANGE_LABELS_PT,
    AGE_RANGE_VALUES,
    type AgeRangeValue,
} from "@/lib/age-range";
import { IconRating12Plus } from "@tabler/icons-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

const MOCK_AGE_RANGE_COUNTS: Record<AgeRangeValue, number> = {
    BABY: 12,
    CHILDREN_I: 45,
    CHILDREN_II: 78,
    TEEN: 210,
    YOUNG: 95,
    ADULT: 52,
    SENIOR: 8,
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
        AGE_RANGE_VALUES.map((range) => [
            range,
            {
                label: AGE_RANGE_LABELS_PT[range],
                color: AGE_RANGE_COLORS[range],
            },
        ]),
    ),
} satisfies ChartConfig;

const chartData = AGE_RANGE_VALUES.map((range) => ({
    range,
    interval: AGE_RANGE_INTERVALS[range],
    count: MOCK_AGE_RANGE_COUNTS[range],
    fill: `var(--color-${range})`,
}));

function StudentsAgeRangeBarChart() {
    const total = chartData.reduce((sum, entry) => sum + entry.count, 0);

    return (
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
            <BarChart
                accessibilityLayer
                data={chartData}
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
                    {chartData.map((entry) => (
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

export default function StudentsAgeRangeChart() {
    return (
        <WrapperFlipCardIndicator
            title="Faixa etária"
            icon={<IconRating12Plus className="size-5" />}
            className="w-full xl:w-3/5"
        >
            <StudentsAgeRangeBarChart />
        </WrapperFlipCardIndicator>
    );
}
