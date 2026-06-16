"use client";

import { useCanWrite } from "@/components/write-access-provider";

export function CanWrite({ children }: { children: React.ReactNode }) {
    const canWrite = useCanWrite();

    if (!canWrite) {
        return null;
    }

    return children;
}
