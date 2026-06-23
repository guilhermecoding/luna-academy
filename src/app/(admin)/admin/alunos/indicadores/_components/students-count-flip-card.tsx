import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import { getTotalStudentsCount } from "@/services/students/students.service";
import { IconUser } from "@tabler/icons-react";
import { Suspense } from "react";
import FlipCardValueSkeleton from "../../../../../../components/skeletons/flip-card-value-skeleton";
import { NumberTicker } from "@/components/ui/number-ticker";

async function StudentsCountContent() {
    const count = await getTotalStudentsCount();

    return (
        <div className="py-4">
            <span className="text-foreground text-3xl font-bold">
                <NumberTicker value={count} />
            </span>
        </div>
    );
}

export default function StudentsCountFlipCard() {
    return (
        <WrapperFlipCardIndicator
            title="Total"
            icon={<IconUser className="size-5" />}
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <StudentsCountContent />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
