import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconSchool } from "@tabler/icons-react";
import StudentsCountFlipCard from "./_components/students-count-flip-card";
import StudentAgeAverage from "./_components/student-age-average";
import StudentsGenderChart from "./_components/students-gender-chart";
import StudentsAgeRangeChart from "./_components/students-age-range-chart";
import StudentOriginSchoolFlipCard from "./_components/student-origin-school-flip-card";

export default function AdminStudentsIndicatorsPage() {
    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconSchool className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Alunos</p>
                </div>
                <TitlePage
                    title="Indicadores"
                />
            </Section>
            <Section className="mt-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <StudentsCountFlipCard />
                    <StudentAgeAverage />
                    <StudentOriginSchoolFlipCard />
                </div>
                <div className="mt-8 flex flex-col xl:flex-row gap-8">
                    <StudentsGenderChart />
                    <StudentsAgeRangeChart />
                </div>
            </Section>
        </Page>
    );
}