import { Suspense } from "react";
import { DualArc } from "@/components/dual-arc";
import TeacherHomeRedirectClient from "../../../_components/teacher-redirect-client";

async function PeriodTeacherPageContent({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {
    const { program, period } = await params;

    return <TeacherHomeRedirectClient targetUrl={`/prof/${program}/periodos/${period}/turmas`} />;
}

export default function PeriodTeacherPage({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen w-full items-center justify-center bg-background">
                    <DualArc className="size-12 text-primary" />
                </div>
            }
        >
            <PeriodTeacherPageContent params={params} />
        </Suspense>
    );
}
