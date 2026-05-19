import { Suspense } from "react";
import { DualArc } from "@/components/dual-arc";
import TeacherHomeRedirectClient from "@/app/(professor)/prof/_components/teacher-redirect-client";

export default async function CourseLessonsTeacherPage({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string; course: string }>;
}) {
    const { program, period, classGroup, course } = await params;

    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen w-full items-center justify-center bg-background">
                    <DualArc className="size-12 text-primary" />
                </div>
            }
        >
            <TeacherHomeRedirectClient targetUrl={`/prof/${program}/periodos/${period}/turmas/${classGroup}/disciplinas/${course}`} />
        </Suspense>
    );
}
