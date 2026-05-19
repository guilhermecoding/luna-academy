import { Suspense } from "react";
import { DualArc } from "@/components/dual-arc";
import TeacherHomeRedirectClient from "@/app/(professor)/prof/_components/teacher-redirect-client";

async function CourseLessonsTeacherPageContent({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string; course: string }>;
}) {
    const { program, period, classGroup, course } = await params;

    return <TeacherHomeRedirectClient targetUrl={`/prof/${program}/periodos/${period}/turmas/${classGroup}/disciplinas/${course}`} />;
}

export default function CourseLessonsTeacherPage({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string; course: string }>;
}) {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen w-full items-center justify-center bg-background">
                    <DualArc className="size-12 text-primary" />
                </div>
            }
        >
            <CourseLessonsTeacherPageContent params={params} />
        </Suspense>
    );
}
