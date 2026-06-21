"use client";

import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { GENRE_LABELS_PT, GENRE_VALUES, type GenreValue } from "@/lib/genre";
import { IconGenderBigender } from "@tabler/icons-react";
import { Pie, PieChart } from "recharts";

const MOCK_GENDER_COUNTS: Record<GenreValue, number> = {
    MALE: 142,
    FEMALE: 118,
    NON_BINARY: 8,
    PREFER_NOT_TO_SAY: 12,
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

const chartData = GENRE_VALUES.map((genre) => ({
    genre,
    count: MOCK_GENDER_COUNTS[genre],
    fill: `var(--color-${genre})`,
}));

function StudentsGenderPieChart() {
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
                                const total = chartData.reduce((sum, entry) => sum + entry.count, 0);
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
                    data={chartData}
                    dataKey="count"
                    nameKey="genre"
                    innerRadius="45%"
                    strokeWidth={2}
                />
                <ChartLegend
                    content={<ChartLegendContent nameKey="genre" />}
                />
            </PieChart>
        </ChartContainer>
    );
}

export default function StudentsGenderChart() {
    return (
        <WrapperFlipCardIndicator
            title="Gênero"
            icon={<IconGenderBigender className="size-5" />}
            className="w-full xl:w-2/5"
        >
            <StudentsGenderPieChart />
        </WrapperFlipCardIndicator>
    );
}
