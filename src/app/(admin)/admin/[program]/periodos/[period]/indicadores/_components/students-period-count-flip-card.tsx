import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";
import { Separator } from "@/components/ui/separator";
import { IconUsers } from "@tabler/icons-react";
import { BadgeTrending, TrendingTextIndicator } from "./shared/trending";



function StudentsPeriodCountFlipCardContent() {
    return (
        <div className="py-4 w-full">
            <div className="w-full flex flex-row justify-between items-center gap-2">
                <span className="text-foreground text-3xl font-bold">277</span>
                {<BadgeTrending status="up" value="10%" />}
            </div>
            <Separator className="my-4" />
            <TrendingTextIndicator
                status="down"
                value={14}
                nextText="o período anterior"
            />
        </div>
    );
}

export default function StudentsPeriodCountFlipCard() {
    return (
        <WrapperFlipCardIndicator
            title="Total de alunos"
            icon={<IconUsers className="size-5" />}
            className="w-max"
        >
            <StudentsPeriodCountFlipCardContent />
        </WrapperFlipCardIndicator>
    );
}
