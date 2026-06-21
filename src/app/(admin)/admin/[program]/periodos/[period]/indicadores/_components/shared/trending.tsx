import { cn } from "@/lib/utils";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

export type TrendingStatus = "up" | "down" | "stable";

export function BadgeTrending({ status, value }: { status: TrendingStatus, value: string }) {
    return (
        <div
            className={cn("flex bg-green-500/10 text-green-600 border border-green-500/20 rounded-full px-2 py-1 flex-row items-center gap-1", {
                "bg-green-500/10 text-green-600 border border-green-500/20": status === "up",
                "bg-red-500/10 text-red-600 border border-red-500/20": status === "down",
                "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20": status === "stable",
            })}>
            {status === "up" ? <IconTrendingUp className="size-4" /> : status === "down" ? <IconTrendingDown className="size-4" /> : null}
            <span className="text-xs font-medium">{value}</span>
        </div>
    );
}

export function TrendingTextIndicator({
    status,
    value,
    nextText = "",
}: {
    status: TrendingStatus,
    value: number
    nextText?: string
}) {
    return (
        <div className={cn("flex flex-row text-sm  text-muted-foreground items-center gap-1", {
            "text-green-500": status === "up",
            "text-red-500": status === "down",
            "text-yellow-500": status === "stable",
        })}>
            <span>
                {status === "up" ? "+" : status === "down" ? "-" : ""}
                {value}
            </span>
            <span className="text-muted-foreground">
                {status === "up" ? "a mais que " : status === "down" ? "a menos que " : ""}
                {nextText}
            </span>
        </div>
    );
}