import AboutPage from "@/components/pages/about-page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sobre",
};

export default function TeacherAboutPage() {
    return <AboutPage />;
}
