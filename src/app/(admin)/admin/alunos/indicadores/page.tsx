import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconSchool } from "@tabler/icons-react";
import StudentsCountFlipCard from "./_components/students-count-flip-card";

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
                <div className="flex">
                    <StudentsCountFlipCard />
                </div>
            </Section>
        </Page>
    );
}