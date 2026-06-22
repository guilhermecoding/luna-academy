import { Separator } from "@/components/ui/separator";
import { BadgeTrending, TrendingTextIndicator, type TrendingStatus } from "./trending";

function getTrendStatus(delta: number): TrendingStatus {
    if (delta > 0) return "up";
    if (delta < 0) return "down";
    return "stable";
}

type PeriodTrendFlipCardBodyProps = {
    value: React.ReactNode;
    delta: number | null;
    percentageChange: number | null;
    nextText?: string;
    badgeSuffix?: string;
    deltaSuffix?: string;
};

export default function PeriodTrendFlipCardBody({
    value,
    delta,
    percentageChange,
    nextText = "o período anterior",
    badgeSuffix = "%",
    deltaSuffix,
}: PeriodTrendFlipCardBodyProps) {
    const hasComparison = delta !== null && percentageChange !== null;

    return (
        <div className="py-4 w-full">
            <div className="w-full flex flex-row justify-between items-center gap-2">
                <span className="text-foreground text-3xl font-bold">{value}</span>
                {hasComparison && (
                    <BadgeTrending
                        status={getTrendStatus(delta)}
                        value={`${percentageChange}${badgeSuffix}`}
                    />
                )}
            </div>
            {hasComparison && (
                <>
                    <Separator className="my-4" />
                    <TrendingTextIndicator
                        status={getTrendStatus(delta)}
                        value={Math.abs(delta)}
                        nextText={nextText}
                        suffix={deltaSuffix}
                    />
                </>
            )}
        </div>
    );
}

export { getTrendStatus };
