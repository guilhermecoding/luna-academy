import { cn } from "@/lib/utils";

export default function WrapperFlipCardIndicator({
    children,
    title,
    className,
}: {
    children: React.ReactNode;
    title: string;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col min-w-32 p-1 bg-surface border border-surface-border rounded-3xl", className)}>
            <div className="px-4 py-2">
                <span className="text-lg font-semibold">{title}</span>
            </div>
            <div className="bg-background px-6 py-4 rounded-2xl">
                {children}
            </div>
        </div>
    );
}
