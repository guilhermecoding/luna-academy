import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import { getTransferredStudentsCount } from "@/services/students/students.service";
import { IconSwipeRightFilled } from "@tabler/icons-react";
import { Suspense } from "react";
import FlipCardValueSkeleton from "../../../../../../components/skeletons/flip-card-value-skeleton";
import { NumberTicker } from "@/components/ui/number-ticker";

async function StudentOriginSchoolContent() {
    const count = await getTransferredStudentsCount();

    return (
        <div className="py-4">
            <span className="text-foreground text-3xl font-bold">
                <NumberTicker value={count} />
            </span>
        </div>
    );
}

export default function StudentOriginSchoolFlipCard() {
    return (
        <WrapperFlipCardIndicator
            title="Transferidos de outras escolas"
            icon={<IconSwipeRightFilled className="size-5" />}
        >
            <Suspense fallback={<FlipCardValueSkeleton />}>
                <StudentOriginSchoolContent />
            </Suspense>
        </WrapperFlipCardIndicator>
    );
}
