import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import FlipCardValueSkeleton from "@/components/skeletons/flip-card-value-skeleton";
import { getPeriodOperationalStats } from "@/services/periods/period-indicators.service";
import { IconProgress } from "@tabler/icons-react";
import { Suspense } from "react";
import { NumberTicker } from "@/components/ui/number-ticker";
import PeriodTrendFlipCardBody from "./shared/period-trend-flip-card-body";

async function EnrollmentRatePeriodFlipCardContent({ periodId }: { periodId: string }) {
    const stats = await getPeriodOperationalStats(periodId);

    return (
        <PeriodTrendFlipCardBody
            value={<><NumberTicker value={stats.enrollmentRate} />%</>}
            delta={stats.enrollmentRateDelta}
            percentageChange={stats.enrollmentRateBadgeValue}
            badgeSuffix=" p.p."
            deltaSuffix=" p.p."
        />
    );
}

export default function EnrollmentRatePeriodFlipCard({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Taxa de enturmação"
            icon={<IconProgress className="size-5" />}
            className="w-86 justify-self-center"
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <EnrollmentRatePeriodFlipCardContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
