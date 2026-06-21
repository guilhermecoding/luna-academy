import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import FlipCardValueSkeleton from "@/components/skeletons/flip-card-value-skeleton";
import { Separator } from "@/components/ui/separator";
import { getPeriodStudentsCountTrend } from "@/services/students/students.service";
import { IconUsers } from "@tabler/icons-react";
import { Suspense } from "react";
import { BadgeTrending, TrendingTextIndicator, type TrendingStatus } from "./shared/trending";

function getTrendStatus(delta: number): TrendingStatus {
    if (delta > 0) return "up";
    if (delta < 0) return "down";
    return "stable";
}

async function StudentsPeriodCountFlipCardContent({ periodId }: { periodId: string }) {
    const { count, delta, percentageChange } = await getPeriodStudentsCountTrend(periodId);
    const hasComparison = delta !== null && percentageChange !== null;

    return (
        <div className="py-4 w-full">
            <div className="w-full flex flex-row justify-between items-center gap-2">
                <span className="text-foreground text-3xl font-bold">{count}</span>
                {hasComparison && (
                    <BadgeTrending
                        status={getTrendStatus(delta)}
                        value={`${percentageChange}%`}
                    />
                )}
            </div>
            {hasComparison && (
                <>
                    <Separator className="my-4" />
                    <TrendingTextIndicator
                        status={getTrendStatus(delta)}
                        value={Math.abs(delta)}
                        nextText="o período anterior"
                    />
                </>
            )}
        </div>
    );
}

export default function StudentsPeriodCountFlipCard({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Total de alunos"
            icon={<IconUsers className="size-5" />}
            className="w-max min-w-68"
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <StudentsPeriodCountFlipCardContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
