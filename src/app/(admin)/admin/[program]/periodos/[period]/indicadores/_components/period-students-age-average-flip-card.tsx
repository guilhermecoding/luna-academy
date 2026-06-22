import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import FlipCardValueSkeleton from "@/components/skeletons/flip-card-value-skeleton";
import { getPeriodStudentProfileStats } from "@/services/periods/period-indicators.service";
import { IconGenderAgender } from "@tabler/icons-react";
import { Suspense } from "react";

async function PeriodStudentsAgeAverageFlipCardContent({ periodId }: { periodId: string }) {
    const { averageAge } = await getPeriodStudentProfileStats(periodId);

    return (
        <div className="py-4">
            <span className="text-foreground text-3xl font-bold">
                {averageAge ?? "—"}
            </span>
        </div>
    );
}

export default function PeriodStudentsAgeAverageFlipCard({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Idade média"
            icon={<IconGenderAgender className="size-6" />}
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <PeriodStudentsAgeAverageFlipCardContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
