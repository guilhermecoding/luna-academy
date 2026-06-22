import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import FlipCardValueSkeleton from "@/components/skeletons/flip-card-value-skeleton";
import { getPeriodOperationalStats } from "@/services/periods/period-indicators.service";
import { IconCircleCheck } from "@tabler/icons-react";
import { Suspense } from "react";
import PeriodTrendFlipCardBody from "./shared/period-trend-flip-card-body";

async function EnrolledStudentsPeriodFlipCardContent({ periodId }: { periodId: string }) {
    const stats = await getPeriodOperationalStats(periodId);

    return (
        <PeriodTrendFlipCardBody
            value={stats.enrolled}
            delta={stats.enrolledDelta}
            percentageChange={stats.enrolledPercentageChange}
        />
    );
}

export default function EnrolledStudentsPeriodFlipCard({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Alunos matriculados"
            icon={<IconCircleCheck className="size-5" />}
            className="w-86 justify-self-center"
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <EnrolledStudentsPeriodFlipCardContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
