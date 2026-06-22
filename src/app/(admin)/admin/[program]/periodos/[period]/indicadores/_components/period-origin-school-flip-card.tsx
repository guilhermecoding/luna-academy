import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import FlipCardValueSkeleton from "@/components/skeletons/flip-card-value-skeleton";
import { getPeriodStudentProfileStats } from "@/services/periods/period-indicators.service";
import { IconSwipeRightFilled } from "@tabler/icons-react";
import { Suspense } from "react";

async function PeriodOriginSchoolFlipCardContent({ periodId }: { periodId: string }) {
    const { transferredCount } = await getPeriodStudentProfileStats(periodId);

    return (
        <div className="py-4">
            <span className="text-foreground text-3xl font-bold">{transferredCount}</span>
        </div>
    );
}

export default function PeriodOriginSchoolFlipCard({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Transferidos de outras escolas"
            icon={<IconSwipeRightFilled className="size-5" />}
            className="w-86 justify-self-center"
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <PeriodOriginSchoolFlipCardContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
