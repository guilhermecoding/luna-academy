import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import { IconGenderAgender } from "@tabler/icons-react";

export default function StudentAgeAverage() {
    return (
        <WrapperFlipCardIndicator title="Idade Média"
            icon={<IconGenderAgender className="size-6" />}
        >
            <div className="py-4">
                <span className="text-foreground text-3xl font-bold ">
                    13
                </span>
            </div>
        </WrapperFlipCardIndicator>
    );
}
