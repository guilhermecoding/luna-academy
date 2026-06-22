import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import FlipCardValueSkeleton from "@/components/skeletons/flip-card-value-skeleton";
import { getPeriodSADAccessStats } from "@/services/periods/period-indicators.service";
import { IconReportSearch } from "@tabler/icons-react";
import { Suspense } from "react";

async function SadAccessPeriodFlipCardContent({ periodId }: { periodId: string }) {
    const { total, viewed, percentage } = await getPeriodSADAccessStats(periodId);

    return (
        <div className="py-4">
            <span className="text-foreground text-3xl font-bold">{percentage}%</span>
            <p className="text-sm text-muted-foreground mt-2">
                {viewed} de {total} visualizaram
            </p>
        </div>
    );
}

export default function SadAccessPeriodFlipCard({ periodId }: { periodId: string }) {
    return (
        <WrapperFlipCardIndicator
            title="Acesso ao SAD"
            icon={<IconReportSearch className="size-5" />}
            className="w-86"
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <SadAccessPeriodFlipCardContent periodId={periodId} />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
