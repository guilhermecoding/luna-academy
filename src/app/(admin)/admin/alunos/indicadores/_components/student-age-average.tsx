import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import { getStudentsAverageAge } from "@/services/students/students.service";
import { IconGenderAgender } from "@tabler/icons-react";
import { Suspense } from "react";
import FlipCardValueSkeleton from "../../../../../../components/skeletons/flip-card-value-skeleton";
import { NumberTicker } from "@/components/ui/number-ticker";

async function StudentAgeAverageContent() {
    const averageAge = await getStudentsAverageAge();

    return (
        <div className="py-4">
            <span className="text-foreground text-3xl font-bold">
                {averageAge !== null ? <NumberTicker value={averageAge} /> : "—"}
            </span>
        </div>
    );
}

export default function StudentAgeAverage() {
    return (
        <WrapperFlipCardIndicator
            title="Idade média"
            icon={<IconGenderAgender className="size-6" />}
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <StudentAgeAverageContent />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
