import { cn } from "@/lib/utils";

export default function WrapperFlipCardIndicator({
    children,
    title,
    className,
    icon,
}: {
    children: React.ReactNode;
    title: string;
    className?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className={cn("flex h-full w-full min-w-0 flex-col p-1 bg-surface border border-surface-border rounded-3xl", className)}>
            <div className="px-4 py-2 flex flex-row items-center gap-2 shrink-0">
                {icon}
                <span className="text-lg font-semibold">{title}</span>
            </div>
            <div className="bg-background flex flex-1 items-center px-6 py-4 rounded-2xl">
                {children}
            </div>
        </div>
    );
}
