import { Skeleton } from "@/components/ui/skeleton";

export default function TimeSlotSkeleton() {
    return (
        <div className="flex flex-col gap-5">
            <Skeleton className="h-6 max-w-32 rounded-xl" />
            <div className="flex flex-row gap-5 flex-wrap">
                <Skeleton className="h-28 w-96 rounded-2xl" />
                <Skeleton className="h-28 w-96 rounded-2xl" />
                <Skeleton className="h-28 w-96 rounded-2xl" />
            </div>
        </div>
    );
}
