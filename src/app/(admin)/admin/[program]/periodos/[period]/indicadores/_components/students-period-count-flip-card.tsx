import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import FlipCardValueSkeleton from "@/components/skeletons/flip-card-value-skeleton";
import { getPeriodOperationalStats } from "@/services/periods/period-indicators.service";
import { IconUsers } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodTrendFlipCardBody from "./shared/period-trend-flip-card-body";

async function StudentsPeriodCountFlipCardContent({ periodId }: { periodId: string }) {
    const stats = await getPeriodOperationalStats(periodId);

    return (
        <PeriodTrendFlipCardBody
            value={stats.total}
            delta={stats.totalDelta}
            percentageChange={stats.totalPercentageChange}
        />
    );
}

export default function StudentsPeriodCountFlipCard({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Total de alunos"
            icon={<IconUsers className="size-5" />}
            className="w-86 justify-self-center"
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <StudentsPeriodCountFlipCardContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
