"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DualArc } from "@/components/dual-arc";

export default function TeacherHomeRedirectClient({ targetUrl }: { targetUrl: string }) {
    const router = useRouter();

    useEffect(() => {
        router.replace(targetUrl);
    }, [targetUrl, router]);

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <DualArc className="size-12 text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                    Carregando seu portal de professor...
                </p>
            </div>
        </div>
    );
}
