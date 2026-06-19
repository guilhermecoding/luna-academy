"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";

export default function TeacherHomeRedirectClient({ targetUrl }: { targetUrl: string }) {
    const router = useRouter();

    useEffect(() => {
        router.replace(targetUrl);
    }, [targetUrl, router]);

    return <Loading />;
}
