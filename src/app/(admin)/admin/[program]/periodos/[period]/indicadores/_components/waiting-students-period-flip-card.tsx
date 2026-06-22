import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import FlipCardValueSkeleton from "@/components/skeletons/flip-card-value-skeleton";
import { getPeriodOperationalStats } from "@/services/periods/period-indicators.service";
import { IconClock } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodTrendFlipCardBody from "./shared/period-trend-flip-card-body";

async function WaitingStudentsPeriodFlipCardContent({ periodId }: { periodId: string }) {
    const stats = await getPeriodOperationalStats(periodId);

    return (
        <PeriodTrendFlipCardBody
            value={stats.waiting}
            delta={stats.waitingDelta}
            percentageChange={stats.waitingPercentageChange}
        />
    );
}

export default function WaitingStudentsPeriodFlipCard({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Em espera"
            icon={<IconClock className="size-5" />}
            className="w-86"
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <WaitingStudentsPeriodFlipCardContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
