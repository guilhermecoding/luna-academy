import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import FlipCardValueSkeleton from "@/components/skeletons/flip-card-value-skeleton";
import { getPeriodStructureStats } from "@/services/periods/period-indicators.service";
import { IconUsersGroup } from "@tabler/icons-react";
import { Suspense } from "react";

async function AvgStudentsPerClassPeriodFlipCardContent({ periodId }: { periodId: string }) {
    const { avgStudentsPerClass } = await getPeriodStructureStats(periodId);

    return (
        <div className="py-4">
            <span className="text-foreground text-3xl font-bold">
                {avgStudentsPerClass.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
            </span>
        </div>
    );
}

export default function AvgStudentsPerClassPeriodFlipCard({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Média alunos/turma"
            icon={<IconUsersGroup className="size-5" />}
            className="w-86 justify-self-center"
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <AvgStudentsPerClassPeriodFlipCardContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
