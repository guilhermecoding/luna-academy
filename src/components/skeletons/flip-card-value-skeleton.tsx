import { Skeleton } from "@/components/ui/skeleton";

export default function FlipCardValueSkeleton() {
    return (
        <div className="py-4">
            <Skeleton className="h-9 w-16 rounded-lg" />
        </div>
    );
}