import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import ChartAreaSkeleton from "@/components/skeletons/chart-area-skeleton";
import { GENRE_VALUES } from "@/lib/genre";
import { getStudentsGenderDistribution } from "@/services/students/students.service";
import { IconGenderBigender } from "@tabler/icons-react";
import { Suspense } from "react";
import StudentsGenderChartClient from "./students-gender-chart-client";

async function StudentsGenderChartContent() {
    const distribution = await getStudentsGenderDistribution();
    const data = GENRE_VALUES.map((genre) => ({
        genre,
        count: distribution[genre],
        fill: `var(--color-${genre})`,
    }));

    return <StudentsGenderChartClient data={data} />;
}

export default function StudentsGenderChart() {
    return (
        <WrapperFlipCardIndicator
            title="Gênero"
            icon={<IconGenderBigender className="size-5" />}
            className="w-full xl:w-2/5"
        >
            <Suspense fallback={<ChartAreaSkeleton />}>
                <StudentsGenderChartContent />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
