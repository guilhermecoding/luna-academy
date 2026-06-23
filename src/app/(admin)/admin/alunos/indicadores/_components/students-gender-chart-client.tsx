"use client";

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { GENRE_LABELS_PT, type GenreValue } from "@/lib/genre";
import { Pie, PieChart, Cell } from "recharts";

export type StudentsGenderChartDataPoint = {
    genre: GenreValue;
    count: number;
    fill: string;
};

const chartConfig = {
    count: {
        label: "Alunos",
    },
    MALE: {
        label: GENRE_LABELS_PT.MALE,
        color: "var(--genre-male)",
    },
    FEMALE: {
        label: GENRE_LABELS_PT.FEMALE,
        color: "var(--genre-female)",
    },
    NON_BINARY: {
        label: GENRE_LABELS_PT.NON_BINARY,
        color: "var(--genre-non-binary)",
    },
    PREFER_NOT_TO_SAY: {
        label: GENRE_LABELS_PT.PREFER_NOT_TO_SAY,
        color: "var(--genre-prefer-not-to-say)",
    },
} satisfies ChartConfig;

type StudentsGenderChartClientProps = {
    data: StudentsGenderChartDataPoint[];
};

export default function StudentsGenderChartClient({ data }: StudentsGenderChartClientProps) {
    const total = data.reduce((sum, entry) => sum + entry.count, 0);

    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-72 w-full"
        >
            <PieChart>
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            hideLabel
                            nameKey="genre"
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
                    nameKey="genre"
                    innerRadius="45%"
                    strokeWidth={2}
                    isAnimationActive
                    animationDuration={800}
                    animationBegin={0}
                >
                    {data.map((entry) => (
                        <Cell key={entry.genre} fill={entry.fill} />
                    ))}
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="genre" />}
                />
            </PieChart>
        </ChartContainer>
    );
}
