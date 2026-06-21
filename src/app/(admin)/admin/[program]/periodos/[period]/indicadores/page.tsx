import BuildFeaturePage from "@/components/build-feature-page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Indicadores Gerais do Período",
};

export default function AdminPeriodIndicatorsPage() {
    return <BuildFeaturePage />;
}