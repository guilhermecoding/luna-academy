import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import { IconSwipeRightFilled } from "@tabler/icons-react";

export default function StudentOriginSchoolFlipCard() {
    return (
        <WrapperFlipCardIndicator
            title="Transferidos de outras escolas"
            icon={<IconSwipeRightFilled className="size-5" />}
        >
            <div className="py-4">
                <span className="text-foreground text-3xl font-bold ">135</span>
            </div>
        </WrapperFlipCardIndicator>
    );
}
