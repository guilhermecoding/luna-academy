import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import { IconUser } from "@tabler/icons-react";

export default function StudentsCountFlipCard() {
    return (
        <WrapperFlipCardIndicator title="Total"
            icon={<IconUser className="size-5" />}
        >
            <div className="py-4">
                <span className="text-foreground text-3xl font-bold ">217</span>
            </div>
        </WrapperFlipCardIndicator>
    );
}
