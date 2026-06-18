"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { verifyTeacherPeriodAccessAction } from "../actions";

export default function PeriodAccessGuard() {
    const params = useParams<{ program: string; period: string }>();
    const pathname = usePathname();
    const router = useRouter();

    const programSlug = params.program;
    const periodSlug = params.period;

    useEffect(() => {
        if (!programSlug || !periodSlug) {
            return;
        }

        let cancelled = false;

        void verifyTeacherPeriodAccessAction(programSlug, periodSlug).then((status) => {
            if (cancelled) {
                return;
            }

            if (status === "unauthenticated") {
                router.replace("/entrar");
                return;
            }

            if (status === "unauthorized") {
                router.replace(`/prof/${programSlug}/periodos`);
                return;
            }

            if (status === "not_found" || status === "completed") {
                router.replace(`/prof/${programSlug}/periodos`);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [pathname, programSlug, periodSlug, router]);

    return null;
}
