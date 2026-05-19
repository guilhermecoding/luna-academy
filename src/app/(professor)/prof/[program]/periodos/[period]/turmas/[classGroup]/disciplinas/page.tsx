import { Suspense } from "react";
import { DualArc } from "@/components/dual-arc";
import TeacherHomeRedirectClient from "@/app/(professor)/prof/_components/teacher-redirect-client";

async function ClassGroupDisciplinesTeacherPageContent({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string }>;
}) {
    const { program, period, classGroup } = await params;

    return <TeacherHomeRedirectClient targetUrl={`/prof/${program}/periodos/${period}/turmas/${classGroup}/disciplinas`} />;
}


export default function ClassGroupDisciplinesTeacherPage({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string }>;
}) {

    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen w-full items-center justify-center bg-background">
                    <DualArc className="size-12 text-primary" />
                </div>
            }
        >
            <ClassGroupDisciplinesTeacherPageContent params={params} />
        </Suspense>
    );
}
