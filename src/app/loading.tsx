import { DualArc } from "@/components/dual-arc";

export default function Loading() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-6">
                <DualArc className="size-12 text-primary" />
                <p className="text-xl font-medium text-muted-foreground animate-pulse">
                    Um momentinho...
                </p>
            </div>
        </div>
    );
}
