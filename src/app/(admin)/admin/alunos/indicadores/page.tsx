import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconAlertSquareRounded, IconSchool } from "@tabler/icons-react";
import StudentsCountFlipCard from "./_components/students-count-flip-card";
import StudentAgeAverage from "./_components/student-age-average";
import StudentOriginSchoolFlipCard from "./_components/student-origin-school-flip-card";
import StudentsIndicatorsCharts from "./_components/students-indicators-charts";

export default function AdminStudentsIndicatorsPage() {
    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconSchool className="size-4 text-muted-foreground shrink-0" />
                    <p className="text-muted-foreground font-bold">Alunos</p>
                </div>
                <TitlePage
                    title="Indicadores"
                />
                <div className="flex sm:hidden flex-row items-start sm:items-center text-muted-foreground gap-1 shrink-0">
                    <IconAlertSquareRounded className="size-3 mt-0.5 shrink-0" />
                    <p className="text-xs">
                        Gráficos em dispositivos móveis podem ser limitados. Verifique em um dispositivo maior para uma melhor visualização.
                    </p>
                </div>
            </Section>
            <Section className="mt-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <StudentsCountFlipCard />
                    <StudentAgeAverage />
                    <StudentOriginSchoolFlipCard />
                </div>
                <StudentsIndicatorsCharts />
            </Section>
        </Page>
    );
}