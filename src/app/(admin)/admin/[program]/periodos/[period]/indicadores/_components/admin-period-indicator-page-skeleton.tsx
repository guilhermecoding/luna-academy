import Section from "@/components/section";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function AdminPeriodIndicatorPageSkeleton() {
    return (
        <Section className="mt-8 grid grid-cols-1 gap-8 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-54 w-86 justify-self-center rounded-3xl" />
            ))}
        </Section>
    );
}
