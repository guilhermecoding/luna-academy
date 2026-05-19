import { Suspense } from "react";
import { DualArc } from "@/components/dual-arc";
import TeacherHomeRedirectClient from "../_components/teacher-redirect-client";

export default async function ProgramTeacherPage({
    params,
}: {
    params: Promise<{ program: string }>;
}) {
    const { program } = await params;

    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen w-full items-center justify-center bg-background">
                    <DualArc className="size-12 text-primary" />
                </div>
            }
        >
            <TeacherHomeRedirectClient targetUrl={`/prof/${program}/periodos`} />
        </Suspense>
    );
}
