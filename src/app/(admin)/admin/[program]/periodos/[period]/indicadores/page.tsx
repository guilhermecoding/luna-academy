import { Metadata } from "next";
import Page from "@/components/page";
import Section from "@/components/section";
import { IconAlertSquareRounded, IconCalendar } from "@tabler/icons-react";
import TitlePage from "@/components/title-page";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { notFound } from "next/navigation";
import StudentsPeriodCountFlipCard from "./_components/students-period-count-flip-card";

export const metadata: Metadata = {
    title: "Indicadores Gerais do Período",
};

export default async function AdminPeriodIndicatorsPage({
    params,
}: PageProps<"/admin/[program]/periodos/[period]">) {
    const { program, period } = await params;
    const periodData = await getPeriodByProgramAndSlug(program, period);

    if (!periodData) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconCalendar className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Período</p>
                </div>
                <TitlePage title="Indicadores Gerais do Período" />
                <div className="flex sm:hidden flex-row items-start sm:items-center text-muted-foreground gap-1 shrink-0">
                    <IconAlertSquareRounded className="size-3 mt-0.5 shrink-0" />
                    <p className="text-xs">
                        Gráficos em dispositivos móveis podem ser limitados. Verifique em um dispositivo maior para uma melhor visualização.
                    </p>
                </div>
            </Section>

            <Section className="mt-8">
                <StudentsPeriodCountFlipCard periodId={periodData.id} />
            </Section>
        </Page>
    );
}
