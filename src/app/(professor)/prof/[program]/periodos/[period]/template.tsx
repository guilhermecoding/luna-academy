import PeriodAccessGuard from "./_components/period-access-guard";

export default function TeacherPeriodTemplate({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <PeriodAccessGuard />
            {children}
        </>
    );
}
