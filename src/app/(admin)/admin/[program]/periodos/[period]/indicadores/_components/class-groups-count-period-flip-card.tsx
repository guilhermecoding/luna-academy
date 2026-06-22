import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import FlipCardValueSkeleton from "@/components/skeletons/flip-card-value-skeleton";
import { getPeriodStructureStats } from "@/services/periods/period-indicators.service";
import { IconSchool } from "@tabler/icons-react";
import { Suspense } from "react";

async function ClassGroupsCountPeriodFlipCardContent({ periodId }: { periodId: string }) {
    const { classGroupsCount } = await getPeriodStructureStats(periodId);

    return (
        <div className="py-4">
            <span className="text-foreground text-3xl font-bold">{classGroupsCount}</span>
        </div>
    );
}

export default function ClassGroupsCountPeriodFlipCard({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Total de turmas"
            icon={<IconSchool className="size-5" />}
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <ClassGroupsCountPeriodFlipCardContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
